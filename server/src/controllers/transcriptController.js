import { YoutubeTranscript } from "youtube-transcript";
import Transcript from "../models/transcriptModel.js";
import path from "path";
import fs from "fs";
import fse from "fs-extra";
import youtubedl from "youtube-dl-exec";
import { createClient as createDeepgramClient } from "@deepgram/sdk";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";

const FFMPEG_PATH = process.env.FFMPEG_PATH;

function resolveFfmpegLocation(raw) {
  if (!raw) return null;
  let p = String(raw).trim();
  // Strip wrapping quotes and trailing semicolons from env definitions
  if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) {
    p = p.slice(1, -1);
  }
  while (p.endsWith(';')) p = p.slice(0, -1);

  // If it's a directory, try to point at ffmpeg.exe within it (Windows)
  try {
    if (fs.existsSync(p) && fs.lstatSync(p).isDirectory()) {
      const candidate = path.join(p, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
      if (fs.existsSync(candidate)) return candidate;
      // If ffmpeg binary not found but directory exists, still return directory (yt-dlp can accept dir)
      return p;
    }
  } catch (_) {
    // ignore fs errors and let fallback happen
  }

  // If it's a file path that exists, use it
  if (fs.existsSync(p)) return p;
  return null;
}
const FFMPEG_LOCATION = resolveFfmpegLocation(FFMPEG_PATH);

function mapDeepgramToSegments(data) {
  try {
    // 1. Unwrap the 'result' wrapper if it exists (Deepgram v3 SDK)
    const payload = data.result || data;
    
    // 2. Locate channels
    const channels = payload?.results?.channels || [];
    if (!channels.length) return [];
    
    const alt = channels[0]?.alternatives?.[0];
    if (!alt) return [];

    const segments = [];

    // 3. Strategy A: Paragraphs (Best for readability)
    const paragraphs = alt.paragraphs?.paragraphs;
    if (Array.isArray(paragraphs)) {
      for (const p of paragraphs) {
        const text = p.sentences?.map(s => s.text).join(' ').trim();
        if (text) {
          segments.push({
            text,
            offset: p.start * 1000, // Convert seconds to ms
            duration: (p.end - p.start) * 1000
          });
        }
      }
      return segments; // Return early if paragraphs worked
    }

    // 4. Strategy B: Words (Fallback if no paragraphs)
    const words = alt.words;
    if (Array.isArray(words)) {
      let bucket = [];
      let startTime = words[0]?.start || 0;
      
      for (const w of words) {
        bucket.push(w.punctuated_word || w.word);
        
        // Group words into ~10 second chunks or end of sentences
        const isSentenceEnd = /[.!?]$/.test(w.punctuated_word || '');
        const isLongEnough = (w.end - startTime) > 10;

        if (isSentenceEnd || isLongEnough) {
          segments.push({
            text: bucket.join(' '),
            offset: startTime * 1000,
            duration: (w.end - startTime) * 1000
          });
          bucket = []; // Reset
          startTime = w.end;
        }
      }
      // Flush remaining words
      if (bucket.length) {
        segments.push({
          text: bucket.join(' '),
          offset: startTime * 1000,
          duration: ((words[words.length-1]?.end || startTime) - startTime) * 1000
        });
      }
    }

    return segments;
  } catch (e) {
    console.error("Mapping Error:", e);
    return [];
  }
}

/**
 * Robust YouTube ID Extractor
 */
export function extractYouTubeId(input) {
  if (!input) return null;
  const match = input.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:&|\?|\/|$)/);
  return match ? match[1] : (input.length === 11 ? input : null);
}

/**
 * MAIN CONTROLLER
 */
export const createYoutubeTranscript = async (req, res) => {
  // Increase timeout for this specific request if possible
  req.setTimeout(600000); // 10 minutes

  let tempFile = null;

  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL required" });

    const videoId = extractYouTubeId(url);
    if (!videoId) return res.status(400).json({ error: "Invalid Video ID" });

    // 1. CHECK CACHE
    const existing = await Transcript.findOne({ videoId }).lean();
    if (existing) {
      return res.json({
        source: 'cache',
        transcript: existing.text,
        segments: existing.rawTranscript || [],
        summary: existing.summary || ''
      });
    }

    // 2. TRY SCRAPING (Fast Path)
    try {
      const raw = await YoutubeTranscript.fetchTranscript(videoId);
      if (raw && raw.length) {
        const fullText = raw.map(s => s.text).join(' ');

        await Transcript.create({ videoId, text: fullText, rawTranscript: raw });
        return res.json({ source: 'scrape', transcript: fullText, segments: raw, summary: '' });
      }

    } catch (e) {
      console.log(`[${videoId}] Scrape failed, trying AI...`);
    }

    // 3. AI FALLBACK (Deepgram)
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) throw new Error("Missing Deepgram API Key");

    const deepgram = createDeepgramClient(apiKey);
    const tempRoot = path.resolve(process.cwd(), "temp");
    await fse.ensureDir(tempRoot);
    tempFile = path.join(tempRoot, `${videoId}-${Date.now()}.m4a`);

    console.log(`[${videoId}] Downloading audio...`);

    // Optimized yt-dlp arguments for Speech-to-Text
    await youtubedl(url, {
      format: 'worstaudio', // smallest audio for fastest download
      output: tempFile,
      ...(FFMPEG_LOCATION ? { ffmpegLocation: FFMPEG_LOCATION } : {}),
      // Optimization Flags
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      // Headers to avoid blocks
      addHeader: ['referer:youtube.com', 'user-agent:googlebot']
    });

    if (!fs.existsSync(tempFile)) throw new Error("Download failed");

    console.log(`[${videoId}] Sending to Deepgram (Nova-2)...`);
    
    // Stream upload (Better for memory than readFile)
    const fileStream = fs.createReadStream(tempFile);
    
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(fileStream, {
      model: "nova-2",
      smart_format: true,
      punctuate: true,
    });

    if (error) throw error;

    // Process Result
    const segments = mapDeepgramToSegments(result); // Pass 'result' specifically
    const fullText = segments.map(s => s.text).join(' ');

    if (!fullText.trim()) {
       return res.json({ source: 'ai_empty', transcript: "No speech detected.", segments: [], summary: '' });
    }

    // Save only transcript; summary is generated separately on-demand
    await Transcript.create({ videoId, text: fullText, rawTranscript: segments });

    return res.json({ 
      source: 'ai', 
      transcript: fullText, 
      segments,
      summary: ''
    });

  } catch (err) {
    console.error("Transcription Error:", err);
    return res.status(500).json({ error: err.message || "Failed to transcribe" });
  } finally {
    // ALWAYS Cleanup
    if (tempFile && await fse.pathExists(tempFile)) {
      await fse.remove(tempFile).catch(() => {}); // Ignore delete errors
    }
  }
};

export const getTranscriptById = async (req, res) => {
  try {
    const { id } = req.params;
    let doc = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      doc = await Transcript.findById(id).lean();
    }

    if (!doc) {
      doc = await Transcript.findOne({ videoId: id }).lean();
    }

    if (!doc) {
      return res.status(404).json({ error: "Transcript not found" });
    }

    return res.json({
      id: doc._id,
      videoId: doc.videoId,
      transcript: doc.text,
      segments: doc.rawTranscript || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch transcript" });
  }
};

export const generateSummary = async (req, res) => {
  try {
    const { id } = req.params;

    let doc = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      doc = await Transcript.findById(id);
    }
    if (!doc) {
      doc = await Transcript.findOne({ videoId: id });
    }

    if (!doc) {
      return res.status(404).json({ error: "Transcript not found" });
    }

    if (doc.summary && doc.summary.trim()) {
      return res.json({ source: 'gemini_cache', summary: doc.summary });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = "You are an expert tutor. Summarize this transcript into: 1) A one-sentence Core Concept. 2) 5-7 Key Bullet Points. 3) A short 'What to remember' conclusion. Transcript: " + doc.text;

    const response = await model.generateContent(prompt);
    const summaryText = (response && response.response && typeof response.response.text === 'function')
      ? response.response.text()
      : (typeof response.text === 'function' ? response.text() : "");

    if (!summaryText || !summaryText.trim()) {
      return res.status(500).json({ error: "Failed to generate summary" });
    }

    doc.summary = summaryText.trim();
    await doc.save();

    return res.json({ source: 'gemini', summary: doc.summary });
  } catch (err) {
    console.error('Summary Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate summary' });
  }
};