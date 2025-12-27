const API_BASE_URL = 'http://localhost:5000';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(API_BASE_URL + path, {
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

export function getNotes() {
  return request('/api/notes', { method: 'GET' });
}

export function createNote(payload: {
  title: string;
  description?: string;
  content: string;
  isAIGenerated?: boolean;
  videoId?: string;
  tags?: string[];
}) {
  return request('/api/notes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function exportNotes() {
  const response = await fetch(`${API_BASE_URL}/api/notes/export`, {
    method: 'GET',
    headers: {
      'Accept': 'application/pdf',
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to export notes');
  }
  
  // Get the filename from the Content-Disposition header or use a default one
  const contentDisposition = response.headers.get('content-disposition');
  const filename = contentDisposition
    ? contentDisposition.split('filename=')[1].replace(/"/g, '')
    : 'notes-export.pdf';
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
  
  return { success: true };
}
