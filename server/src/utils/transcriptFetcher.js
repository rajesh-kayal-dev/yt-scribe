import { YoutubeTranscript } from "youtube-transcript";
import path from "path";
import fs from "fs";
import fse from "fs-extra";
import youtubedl from "youtube-dl-exec";
import { createClient as createDeepgramClient } from "@deepgram/sdk";

// Reuse env-based FFmpeg path sanitation similar to transcriptController
const FFMPEG_PATH = process.env.FFMPEG_PATH;
function resolveFfmpegLocation(raw) {
  if (!raw) return null;
  let p = String(raw).trim();
  if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) {
    p = p.slice(1, -1);
  }
  while (p.endsWith(';')) p = p.slice(0, -1);
  try {
    if (fs.existsSync(p) && fs.lstatSync(p).isDirectory()) {
      const candidate = path.join(p, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
      if (fs.existsSync(candidate)) return candidate;
      return p;
    }
  } catch {}
  if (fs.existsSync(p)) return p;
  return null;
}
const FFMPEG_LOCATION = resolveFfmpegLocation(FFMPEG_PATH);

export function extractYouTubeId(input) {
  if (!input) return null;
  const match = input.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:&|\?|\/|$)/);
  return match ? match[1] : (input.length === 11 ? input : null);
}

function mapDeepgramToSegments(data) {
  try {
    const payload = data.result || data;
    const channels = payload?.results?.channels || [];
    if (!channels.length) return [];
    const alt = channels[0]?.alternatives?.[0];
    if (!alt) return [];
    const segments = [];
    const paragraphs = alt.paragraphs?.paragraphs;
    if (Array.isArray(paragraphs)) {
      for (const p of paragraphs) {
        const text = p.sentences?.map(s => s.text).join(' ').trim();
        if (text) {
          segments.push({ text, offset: p.start * 1000, duration: (p.end - p.start) * 1000 });
        }
      }
      return segments;
    }
    const words = alt.words;
    if (Array.isArray(words)) {
      let bucket = [];
      let startTime = words[0]?.start || 0;
      for (const w of words) {
        bucket.push(w.punctuated_word || w.word);
        const isSentenceEnd = /[.!?]$/.test(w.punctuated_word || '');
        const isLongEnough = (w.end - startTime) > 10;
        if (isSentenceEnd || isLongEnough) {
          segments.push({ text: bucket.join(' '), offset: startTime * 1000, duration: (w.end - startTime) * 1000 });
          bucket = [];
          startTime = w.end;
        }
      }
      if (bucket.length) {
        segments.push({
          text: bucket.join(' '),
          offset: startTime * 1000,
          duration: ((words[words.length - 1]?.end || startTime) - startTime) * 1000,
        });
      }
    }
    return segments;
  } catch {
    return [];
  }
}

// Fetch full transcript text only (no DB writes). Returns string.
export async function fetchTranscriptTextOnly(inputUrlOrId) {
  const videoId = extractYouTubeId(inputUrlOrId);
  if (!videoId) throw new Error('Invalid Video ID');

  // 1. Try scraping captions
  try {
    const raw = await YoutubeTranscript.fetchTranscript(videoId);
    if (raw && raw.length) {
      return raw.map(s => s.text).join(' ');
    }
  } catch {}

  // 2. Fallback to AI (Deepgram)
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) throw new Error('Missing Deepgram API Key');

  const deepgram = createDeepgramClient(apiKey);
  const tempRoot = path.resolve(process.cwd(), 'temp');
  await fse.ensureDir(tempRoot);
  const tempFile = path.join(tempRoot, `${videoId}-${Date.now()}.m4a`);

  try {
    await youtubedl(`https://www.youtube.com/watch?v=${videoId}`, {
      format: 'worstaudio',
      output: tempFile,
      ...(FFMPEG_LOCATION ? { ffmpegLocation: FFMPEG_LOCATION } : {}),
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
    });

    if (!fs.existsSync(tempFile)) throw new Error('Download failed');

    const fileStream = fs.createReadStream(tempFile);
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(fileStream, {
      model: 'nova-2',
      smart_format: true,
      punctuate: true,
    });
    if (error) throw error;

    const segments = mapDeepgramToSegments(result);
    return segments.map(s => s.text).join(' ');
  } finally {
    if (await fse.pathExists(tempFile)) {
      await fse.remove(tempFile).catch(() => {});
    }
  }
}
