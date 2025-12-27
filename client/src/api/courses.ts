const API_BASE_URL = 'http://localhost:5000';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(API_BASE_URL + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    throw new Error(data?.message || 'Request failed');
  }
  return data;
}

export function fetchMarketplaceCourses() {
  return request('/api/courses/marketplace', { method: 'GET' });
}

export function createCourse(payload: any) {
  return request('/api/courses', { method: 'POST', body: JSON.stringify(payload) });
}

export function listCourses(params?: { search?: string; category?: string; sort?: string; page?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.search) q.set('search', params.search);
  if (params?.category) q.set('category', params.category);
  if (params?.sort) q.set('sort', params.sort);
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  const qs = q.toString();
  return request(`/api/courses${qs ? `?${qs}` : ''}`, { method: 'GET' });
}

export function getCourse(id: string) {
  return request(`/api/courses/${id}`, { method: 'GET' });
}

export function updateCourse(id: string, payload: any) {
  return request(`/api/courses/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}
