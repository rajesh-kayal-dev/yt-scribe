function ensureEnv() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error('YOUTUBE_API_KEY is not configured');
  return key;
}

export function extractVideoIdFromUrl(url) {
  try {
    const str = String(url || '').trim();
    // If raw 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;

    // youtu.be short links
    const shortMatch = str.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];

    const u = new URL(str);
    // Standard watch URL
    const v = u.searchParams.get('v');
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

    // Embedded or shorts paths: /embed/ID, /shorts/ID
    const parts = u.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || '';
    if (/^[a-zA-Z0-9_-]{11}$/.test(last)) return last;

    return null;
  } catch {
    // Fallback regex search in plain string
    const m = String(url || '').match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }
}

export function extractPlaylistId(url) {
  try {
    const u = new URL(url);
    if (u.searchParams.get('list')) return u.searchParams.get('list');
    // sometimes short urls may include playlist
    const m = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return m ? m[1] : null;
  } catch {
    const m = String(url || '').match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return m ? m[1] : null;
  }
}

function pickThumb(thumbnails) {
  if (!thumbnails) return undefined;
  return (
    thumbnails.medium?.url ||
    thumbnails.high?.url ||
    thumbnails.standard?.url ||
    thumbnails.default?.url
  );
}

function iso8601ToSeconds(iso) {
  // PT#H#M#S
  if (!iso) return 0;
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const m = iso.match(regex);
  if (!m) return 0;
  const h = parseInt(m[1] || '0', 10);
  const min = parseInt(m[2] || '0', 10);
  const s = parseInt(m[3] || '0', 10);
  return h * 3600 + min * 60 + s;
}

function secondsToDisplay(sec) {
  if (!sec || sec <= 0) return '0:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

export async function fetchYoutubePlaylist(url) {
  const key = ensureEnv();
  const playlistId = extractPlaylistId(url);
  if (!playlistId) {
    const err = new Error('Invalid YouTube playlist URL');
    err.statusCode = 400;
    throw err;
  }

  const base = 'https://www.googleapis.com/youtube/v3';

  // Fetch playlist metadata
  const metaRes = await fetch(
    `${base}/playlists?part=snippet&id=${encodeURIComponent(playlistId)}&key=${key}`
  );
  const metaJson = await metaRes.json();
  if (!metaRes.ok || !metaJson.items || metaJson.items.length === 0) {
    const err = new Error(metaJson.error?.message || 'Playlist not found');
    err.statusCode = metaRes.status || 404;
    throw err;
  }
  const meta = metaJson.items[0].snippet;

  // Fetch items (paged)
  let nextPageToken = '';
  const items = [];
  while (true) {
    const itemsRes = await fetch(
      `${base}/playlistItems?part=snippet&playlistId=${encodeURIComponent(
        playlistId
      )}&maxResults=50&pageToken=${nextPageToken}&key=${key}`
    );
    const itemsJson = await itemsRes.json();
    if (!itemsRes.ok) {
      const err = new Error(itemsJson.error?.message || 'Failed to fetch playlist items');
      err.statusCode = itemsRes.status || 500;
      throw err;
    }
    for (const it of itemsJson.items || []) {
      const sn = it.snippet;
      const vid = sn.resourceId?.videoId;
      if (!vid) continue;
      items.push({
        youtubeVideoId: vid,
        title: sn.title,
        description: sn.description,
        position: sn.position,
        thumbnailUrl: pickThumb(sn.thumbnails),
      });
    }
    nextPageToken = itemsJson.nextPageToken || '';
    if (!nextPageToken) break;
  }

  // Fetch durations via videos.list (batched)
  const addDurations = async () => {
    for (let i = 0; i < items.length; i += 50) {
      const batch = items.slice(i, i + 50);
      const ids = batch.map((b) => b.youtubeVideoId).join(',');
      const vRes = await fetch(
        `${base}/videos?part=contentDetails&id=${ids}&key=${key}`
      );
      const vJson = await vRes.json();
      const map = new Map();
      for (const row of vJson.items || []) {
        map.set(row.id, row.contentDetails?.duration);
      }
      batch.forEach((b) => {
        const iso = map.get(b.youtubeVideoId);
        const seconds = iso8601ToSeconds(iso || '');
        b.duration = secondsToDisplay(seconds);
      });
    }
  };
  await addDurations();

  return {
    playlistId,
    title: meta.title,
    description: meta.description,
    channelTitle: meta.channelTitle,
    thumbnailUrl: pickThumb(meta.thumbnails),
    videos: items,
  };
}

// Fetch single video metadata by YouTube ID
export async function fetchVideoMetadata(youtubeId) {
  const key = ensureEnv();
  if (!youtubeId) {
    const err = new Error('youtubeId is required');
    err.statusCode = 400;
    throw err;
  }

  const base = 'https://www.googleapis.com/youtube/v3';
  const res = await fetch(
    `${base}/videos?part=snippet,contentDetails,statistics&id=${encodeURIComponent(youtubeId)}&key=${key}`
  );
  const json = await res.json();
  if (!res.ok || !json.items || json.items.length === 0) {
    const err = new Error(json.error?.message || 'Video not found');
    err.statusCode = res.status || 404;
    throw err;
  }

  const v = json.items[0];
  const sn = v.snippet || {};
  const cd = v.contentDetails || {};
  const seconds = iso8601ToSeconds(cd.duration || '');

  return {
    youtubeId,
    title: sn.title,
    description: sn.description,
    channelTitle: sn.channelTitle,
    channelId: sn.channelId,
    duration: seconds,
    thumbnails: sn.thumbnails || {},
    publishedAt: sn.publishedAt,
  };
}

// Fetch playlist videos metadata by playlistId, batching requests
export async function fetchPlaylistVideos(playlistId) {
  const key = ensureEnv();
  if (!playlistId) {
    const err = new Error('playlistId is required');
    err.statusCode = 400;
    throw err;
  }

  const base = 'https://www.googleapis.com/youtube/v3';
  let nextPageToken = '';
  const videoIds = [];
  const rawSnippets = new Map();

  // Collect video IDs
  while (true) {
    const itemsRes = await fetch(
      `${base}/playlistItems?part=snippet&playlistId=${encodeURIComponent(playlistId)}&maxResults=50&pageToken=${nextPageToken}&key=${key}`
    );
    const itemsJson = await itemsRes.json();
    if (!itemsRes.ok) {
      const err = new Error(itemsJson.error?.message || 'Failed to fetch playlist items');
      err.statusCode = itemsRes.status || 500;
      throw err;
    }
    for (const it of itemsJson.items || []) {
      const sn = it.snippet || {};
      const vid = sn.resourceId?.videoId;
      if (!vid) continue;
      videoIds.push(vid);
      rawSnippets.set(vid, sn);
    }
    nextPageToken = itemsJson.nextPageToken || '';
    if (!nextPageToken) break;
  }

  // Batch fetch details
  const results = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const vRes = await fetch(
      `${base}/videos?part=snippet,contentDetails&id=${batch.join(',')}&key=${key}`
    );
    const vJson = await vRes.json();
    if (!vRes.ok) {
      const err = new Error(vJson.error?.message || 'Failed to fetch video details');
      err.statusCode = vRes.status || 500;
      throw err;
    }
    for (const row of vJson.items || []) {
      const id = row.id;
      const sn = row.snippet || rawSnippets.get(id) || {};
      const cd = row.contentDetails || {};
      const seconds = iso8601ToSeconds(cd.duration || '');
      results.push({
        youtubeId: id,
        title: sn.title,
        description: sn.description,
        channelTitle: sn.channelTitle,
        channelId: sn.channelId,
        duration: seconds,
        thumbnails: sn.thumbnails || {},
        publishedAt: sn.publishedAt,
      });
    }
  }

  return results;
}
