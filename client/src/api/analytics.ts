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

export type AnalyticsSummary = {
  summary: {
    videosCompleted: number;
    videosInProgress: number;
    playlistsCount: number;
    timeSpentToday: string;
  };
  timeSpentLearning: {
    streakDays: number;
    avgDailyTime: number;
    weeklyData: { day: string; minutes: number }[];
  };
  playlistProgress: { title: string; progressPercent: number }[];
  overallProgress: { completed: number; inProgress: number; pending: number };
  recentAchievements: { title: string; icon: string; date: string }[];
};

export async function getAnalyticsSummary(): Promise<{ success: boolean; data: AnalyticsSummary }> {
  return request('/api/analytics/summary', { method: 'GET' });
}
