const API_BASE_URL = 'http://localhost:5000';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(API_BASE_URL + path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    const message = data?.message || 'Request failed';
    throw new Error(message);
  }
  return data;
}

export function getMyPlaylists(params?: { sort?: string; limit?: number; page?: number }) {
  const query = new URLSearchParams();
  if (params?.sort) query.set('sort', params.sort);
  if (typeof params?.limit === 'number') query.set('limit', String(params.limit));
  if (typeof params?.page === 'number') query.set('page', String(params.page));
  const qs = query.toString();
  return request(`/api/playlists/me${qs ? `?${qs}` : ''}`, { method: 'GET' });
}

export function getPlaylist(id: string) {
  return request(`/api/playlists/${id}`, { method: 'GET' });
}

export function createPlaylist(payload: {
  title: string;
  description?: string | null;
  category?: string | null;
  thumbnailUrl?: string | null;
  firstVideoUrl?: string | null;
}) {
  return request('/api/playlists', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function importPlaylist(payload: { playlistUrl: string; title?: string }) {
  return request('/api/playlists/import', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function importYoutubePlaylist(url: string) {
  return request('/api/playlists/import-youtube', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

export function addVideo(playlistId: string, payload: { title: string; youtubeUrl: string; order?: number }) {
  return request(`/api/playlists/${playlistId}/videos`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateVideoStatus(playlistId: string, videoId: string, status: 'not_started' | 'watching' | 'completed') {
  return request(`/api/playlists/${playlistId}/videos/${videoId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function saveVideoProgress(playlistId: string, videoId: string, payload: { currentTime: number; status: 'watching' | 'paused' | 'completed' }) {
  return request(`/api/playlists/${playlistId}/videos/${videoId}/progress`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function generatePlaylistVideoNotes(payload: { url?: string; videoId?: string }) {
  return request('/api/playlists/notes/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deletePlaylist(id: string) {
  return request(`/api/playlists/${id}`, { method: 'DELETE' });
}

export function updatePlaylist(id: string, data: { title?: string; description?: string }) {
  return request(`/api/playlists/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function removeVideo(playlistId: string, videoId: string) {
  return request(`/api/playlists/${playlistId}/videos/${videoId}`, {
    method: 'DELETE',
  });
}
