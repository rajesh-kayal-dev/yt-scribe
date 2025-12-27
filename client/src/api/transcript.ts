import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export async function createYoutubeTranscript(url: string) {
  const { data } = await api.post('/api/transcript/youtube', { url });
  return data;
}

export async function getTranscriptById(id: string) {
  const { data } = await api.get(`/api/transcript/${id}`);
  return data;
}

export async function generateSummary(id: string) {
  const { data } = await api.post(`/api/transcript/${id}/summary`);
  return data;
}
