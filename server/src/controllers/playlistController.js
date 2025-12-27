import { Playlist } from '../models/playlistModel.js';
import { fetchYoutubePlaylist, fetchVideoMetadata, extractVideoIdFromUrl } from '../utils/youtube.js';
import { fetchTranscriptTextOnly, extractYouTubeId } from '../utils/transcriptFetcher.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

function parseYoutubeVideoId(url) {
  try {
    if (!url) return null;
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.split('/')[1] || null;
    }
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    const paths = u.pathname.split('/');
    const idx = paths.indexOf('embed');
    if (idx !== -1 && paths[idx + 1]) return paths[idx + 1];
    return null;
  } catch {
    return null;
  }
}

export async function removeVideoFromPlaylist(req, res, next) {
  try {
    const userId = req.user?.id;
    const { id, videoId } = req.params;

    const playlist = await Playlist.findOne({ _id: id, user: userId });
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });

    const v = playlist.videos.id(videoId);
    if (!v) return res.status(404).json({ success: false, message: 'Video not found' });

    v.deleteOne();
    playlist.progress = computeProgress(playlist.videos);
    await playlist.save();

    const sorted = {
      ...playlist.toObject(),
      videos: [...(playlist.videos || [])].sort((a, b) => (a.order || 0) - (b.order || 0)),
    };

    return res.json({ success: true, playlist: sorted });
  } catch (err) {
    next(err);
  }
}

// NEW: get playlists for logged-in user (simple variant used by /me)
export async function getUserPlaylists(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const items = await Playlist.find({ user: userId }).sort({ createdAt: -1 });
    return res.json({ success: true, playlists: items });
  } catch (err) {
    next(err);
  }
}

function computeProgress(videos = []) {
  if (!videos.length) return 0;
  const completed = videos.filter((v) => v.status === 'completed').length;
  return Math.round((completed / videos.length) * 100);
}

export async function createPlaylist(req, res, next) {
  try {
    const { title, description, category, thumbnailUrl, firstVideoUrl, videos: inputVideos } = req.body || {};
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const videos = [];
    let orderCounter = 1;
    // Backward compatible single URL
    if (firstVideoUrl) {
      const id = extractVideoIdFromUrl(firstVideoUrl) || parseYoutubeVideoId(firstVideoUrl);
      try {
        if (id) {
          const meta = await fetchVideoMetadata(id);
          videos.push({
            title: meta.title || `Video ${orderCounter}`,
            description: meta.description,
            thumbnailUrl: meta.thumbnails?.high?.url || meta.thumbnails?.medium?.url,
            duration: typeof meta.duration === 'number' ? meta.duration : 0,
            status: 'not_started',
            youtubeUrl: firstVideoUrl,
            youtubeVideoId: id,
            channelTitle: meta.channelTitle,
            channelId: meta.channelId,
            publishedAt: meta.publishedAt ? new Date(meta.publishedAt) : undefined,
            order: orderCounter,
          });
          orderCounter++;
        }
      } catch {
        // fallback minimal entry if metadata fails
        const vid = parseYoutubeVideoId(firstVideoUrl);
        videos.push({ title: `Video ${orderCounter}`, youtubeUrl: firstVideoUrl, videoId: vid || undefined, order: orderCounter, status: 'not_started' });
        orderCounter++;
      }
    }
    // New array input of URLs/IDs
    if (Array.isArray(inputVideos)) {
      for (const item of inputVideos) {
        const raw = typeof item === 'string' ? item : item?.url || item?.youtubeId;
        if (!raw) continue;
        const id = extractVideoIdFromUrl(raw) || parseYoutubeVideoId(raw);
        if (!id) continue;
        try {
          const meta = await fetchVideoMetadata(id);
          videos.push({
            title: meta.title || `Video ${orderCounter}`,
            description: meta.description,
            thumbnailUrl: meta.thumbnails?.high?.url || meta.thumbnails?.medium?.url,
            duration: typeof meta.duration === 'number' ? meta.duration : 0,
            status: 'not_started',
            youtubeUrl: typeof item === 'string' ? item : item?.url,
            youtubeVideoId: id,
            channelTitle: meta.channelTitle,
            channelId: meta.channelId,
            publishedAt: meta.publishedAt ? new Date(meta.publishedAt) : undefined,
            order: orderCounter,
          });
          orderCounter++;
        } catch {
          // ignore invalid videos silently
        }
      }
    }

    const playlist = await Playlist.create({
      user: userId,
      title,
      description: description || '',
      category: category || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
      source: 'youtube',
      videos,
      progress: computeProgress(videos),
    });

    return res.status(201).json({ success: true, playlist });
  } catch (err) {
    next(err);
  }
}

// NEW: Import YouTube playlist using real YouTube Data API
export async function importYoutubePlaylist(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const { url } = req.body || {};
    if (!url) return res.status(400).json({ success: false, message: 'url is required' });

    const data = await fetchYoutubePlaylist(url);

    const videos = (data.videos || []).map((v) => ({
      title: v.title,
      description: v.description,
      youtubeVideoId: v.youtubeVideoId,
      position: v.position,
      thumbnailUrl: v.thumbnailUrl,
      // store a numeric duration in seconds if needed later (we keep display string elsewhere)
      // here we skip conversion; UI can use display duration from API if needed
      status: 'not_started',
    }));

    const playlist = await Playlist.create({
      user: userId,
      source: 'youtube',
      youtubePlaylistId: data.playlistId,
      title: data.title,
      description: data.description,
      channelTitle: data.channelTitle,
      thumbnailUrl: data.thumbnailUrl,
      itemCount: videos.length,
      videos,
      progress: 0,
    });

    return res.status(201).json({ success: true, playlist });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status);
    next(err);
  }
}

export async function importPlaylistFromYoutube(req, res, next) {
  try {
    const { playlistUrl, title } = req.body || {};
    if (!playlistUrl) {
      return res.status(400).json({ success: false, message: 'playlistUrl is required' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    let playlistId = null;
    try {
      const u = new URL(playlistUrl);
      playlistId = u.searchParams.get('list') || null;
    } catch {}

    const mockCount = 4;
    const videos = Array.from({ length: mockCount }).map((_, i) => {
      const idx = i + 1;
      const vId = `${playlistId || 'mock'}_${idx}`;
      return {
        title: `Video ${idx}`,
        youtubeUrl: `https://www.youtube.com/watch?v=${vId}`,
        videoId: vId,
        order: idx,
        status: 'not_started',
        thumbnailUrl: `https://img.youtube.com/vi/${vId}/hqdefault.jpg`,
      };
    });

    const playlist = await Playlist.create({
      user: userId,
      title: title || 'Imported Playlist',
      description: 'Imported from YouTube',
      source: 'youtube',
      videos,
      progress: computeProgress(videos),
    });

    return res.status(201).json({ success: true, playlist });
  } catch (err) {
    next(err);
  }
}

export async function getMyPlaylists(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const { sort = 'recent', limit = 12, page = 1 } = req.query;
    const lim = Math.min(parseInt(limit, 10) || 12, 50);
    const pg = Math.max(parseInt(page, 10) || 1, 1);

    const sortObj = sort === 'recent' ? { createdAt: -1 } : { updatedAt: -1 };

    const [items, total] = await Promise.all([
      Playlist.find({ user: userId })
        .sort(sortObj)
        .skip((pg - 1) * lim)
        .limit(lim)
        .select('_id title description thumbnailUrl progress videos createdAt'),
      Playlist.countDocuments({ user: userId }),
    ]);

    const playlists = items.map((p) => ({
      _id: p._id,
      title: p.title,
      description: p.description,
      thumbnailUrl: p.thumbnailUrl,
      progress: p.progress || 0,
      videosCount: Array.isArray(p.videos) ? p.videos.length : 0,
      createdAt: p.createdAt,
    }));

    return res.json({ success: true, playlists, total, page: pg, limit: lim });
  } catch (err) {
    next(err);
  }
}

export async function getPlaylistById(req, res, next) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const playlist = await Playlist.findOne({ _id: id, user: userId });
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    const sorted = {
      ...playlist.toObject(),
      videos: [...(playlist.videos || [])].sort((a, b) => (a.order || 0) - (b.order || 0)),
    };
    return res.json({ success: true, playlist: sorted });
  } catch (err) {
    next(err);
  }
}

export async function addVideoToPlaylist(req, res, next) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title, youtubeUrl, order } = req.body || {};
    if (!title || !youtubeUrl) {
      return res.status(400).json({ success: false, message: 'title and youtubeUrl are required' });
    }
    const playlist = await Playlist.findOne({ _id: id, user: userId });
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });

    const videoId = parseYoutubeVideoId(youtubeUrl);
    const newOrder = typeof order === 'number' ? order : (playlist.videos?.length || 0) + 1;

    // Fetch video metadata if possible
    let videoData = { 
      title, 
      youtubeUrl, 
      youtubeVideoId: videoId, 
      videoId: videoId || undefined, 
      order: newOrder, 
      status: 'not_started' 
    };

    if (videoId) {
      try {
        const meta = await fetchVideoMetadata(videoId);
        videoData = {
          ...videoData,
          title: meta.title || title,
          description: meta.description,
          thumbnailUrl: meta.thumbnails?.high?.url || meta.thumbnails?.medium?.url,
          duration: typeof meta.duration === 'number' ? meta.duration : 0,
          channelTitle: meta.channelTitle,
          channelId: meta.channelId,
          publishedAt: meta.publishedAt ? new Date(meta.publishedAt) : undefined,
        };
      } catch (err) {
        console.warn('Failed to fetch video metadata:', err.message);
        // Continue with basic info if metadata fetch fails
      }
    }

    playlist.videos.push(videoData);
    playlist.progress = computeProgress(playlist.videos);

    await playlist.save();

    const sorted = {
      ...playlist.toObject(),
      videos: [...(playlist.videos || [])].sort((a, b) => (a.order || 0) - (b.order || 0)),
    };

    return res.status(200).json({ success: true, playlist: sorted });
  } catch (err) {
    next(err);
  }
}

export async function updateVideoStatus(req, res, next) {
  try {
    const userId = req.user?.id;
    const { id, videoId } = req.params;
    const { status } = req.body || {};

    const allowed = ['not_started', 'watching', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const playlist = await Playlist.findOne({ _id: id, user: userId });
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });

    const v = playlist.videos.id(videoId);
    if (!v) return res.status(404).json({ success: false, message: 'Video not found' });

    v.status = status;
    playlist.progress = computeProgress(playlist.videos);

    await playlist.save();

    const sorted = {
      ...playlist.toObject(),
      videos: [...(playlist.videos || [])].sort((a, b) => (a.order || 0) - (b.order || 0)),
    };

    return res.json({ success: true, playlist: sorted });
  } catch (err) {
    next(err);
  }
}

export async function deletePlaylist(req, res, next) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    // Ensure ownership first
    const owned = await Playlist.findOne({ _id: id, user: userId });
    if (!owned) return res.status(404).json({ success: false, message: 'Playlist not found' });
    await Playlist.findByIdAndDelete(id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function updatePlaylist(req, res, next) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title, description } = req.body || {};

    // Ensure the playlist belongs to the user
    const owned = await Playlist.findOne({ _id: id, user: userId });
    if (!owned) return res.status(404).json({ success: false, message: 'Playlist not found' });

    const update = {};
    if (typeof title === 'string') update.title = title;
    if (typeof description === 'string') update.description = description;

    const updated = await Playlist.findByIdAndUpdate(id, update, { new: true });
    return res.json({ success: true, playlist: updated });
  } catch (err) {
    next(err);
  }
}

export async function generatePlaylistVideoNotes(req, res, next) {
  try {
    const { url, videoId } = req.body || {};
    const id = extractYouTubeId(url || videoId);
    if (!id) return res.status(400).json({ success: false, message: 'videoId or url required' });

    const text = await fetchTranscriptTextOnly(id);
    if (!text || !text.trim()) {
      return res.status(200).json({ success: true, notes: 'No speech detected or transcript unavailable.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, message: 'Missing GEMINI_API_KEY' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are an expert learning coach. Read the following video transcript and create detailed, highly structured study notes **in Markdown**.

Strictly follow this structure:

1. # Title
   - One line, concise title capturing the core topic.

2. ## Overview
   - 2–4 bullet points summarizing the big picture.

3. ## Key Sections
   For each major section of the transcript, create a subsection:
   - ### [Section Name]
     - **Key Idea 1:** short explanation
     - **Key Idea 2:** short explanation
     - Bullet list of very concrete, pinpoint insights (3–7 bullets).
     - If there are steps or processes, use a **numbered list** for them.

4. ## Examples & Analogies
   - Bullet list of the best examples, analogies, or stories that clarify ideas.

5. ## Important Definitions / Formulas (if applicable)
   - Present as a Markdown table:
     | Term / Formula | Plain-language meaning | Notes |
     | --- | --- | --- |

6. ## Actionable Takeaways
   - 5–10 bullet points of what the learner should **do, remember, or apply**.

Guidelines:
- Use simple, student-friendly language.
- Prefer short paragraphs and clear bullet points.
- Use bold text to highlight key terms.
- Only include tables where it genuinely helps (e.g., terms vs meanings).

TRANSCRIPT:
${text}`;

    const response = await model.generateContent(prompt);
    const notes = (response && response.response && typeof response.response.text === 'function')
      ? response.response.text()
      : (typeof response.text === 'function' ? response.text() : '');

    return res.json({ success: true, notes: (notes || '').trim() });
  } catch (err) {
    console.error('Playlist Notes Error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to generate notes' });
  }
}
