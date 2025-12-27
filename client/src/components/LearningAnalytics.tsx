import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCcw, Clock, Target, Flame, BarChart3, Award, Trophy, BookOpen, PlayCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { getAnalyticsSummary, type AnalyticsSummary } from '../api/analytics';
import confetti from 'canvas-confetti';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

export function LearningAnalytics() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const firedConfetti = useRef(false);

  async function load() {
    setLoading(true);
    try {
      const res = await getAnalyticsSummary();
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!loading && data && !firedConfetti.current) {
      firedConfetti.current = true;
      setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.2 } }), 300);
    }
  }, [loading, data]);

  const totalVideos = useMemo(() => {
    if (!data) return 0;
    const o = data.overallProgress;
    return (o.completed || 0) + (o.inProgress || 0) + (o.pending || 0);
  }, [data]);

  const completionRate = useMemo(() => {
    if (!data || totalVideos === 0) return 0;
    return Math.round((data.overallProgress.completed / totalVideos) * 100);
  }, [data, totalVideos]);

  const weeklyData = data?.timeSpentLearning.weeklyData || [];
  const maxMinutes = Math.max(1, ...weeklyData.map((d) => d.minutes));
  const totalWeeklyMinutes = weeklyData.reduce((sum, d) => sum + d.minutes, 0);
  const streak = data?.timeSpentLearning.streakDays || 0;
  const playlists = (data?.playlistProgress || []).map((p, i) => ({
    name: p.title,
    progress: p.progressPercent,
    videos: undefined as unknown as number,
    color: ['from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500', 'from-purple-500 to-pink-500', 'from-orange-500 to-red-500'][i % 4],
  }));

  function handleRefresh() {
    setRefreshing(true);
    setData(null);
    load().finally(() => setRefreshing(false));
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Learning Analytics
              </span>
            </h1>
            <i className="text-muted-foreground text-sm">Track your progress and stay motivated</i>
          </div>
        </div>

        {/* Streak Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 px-4 py-2">
            <Flame className="w-4 h-4 text-orange-500" />
            {loading ? '—' : `${streak} day streak 🔥`}
          </Badge>
          <Badge variant="outline" className="gap-1 px-4 py-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Level 8 Learner
          </Badge>
          <button onClick={handleRefresh} className="ml-auto inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:shadow transition-all duration-500">
            <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              {loading ? '—' : `${completionRate}%`}
            </Badge>
          </div>
          <div className="text-3xl mb-1">{loading ? <Skeleton className="h-8 w-16" /> : data?.overallProgress.completed}</div>
          <div className="text-sm text-muted-foreground">Videos Completed</div>
        </Card>

        <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-accent/5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <PlayCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl mb-1">{loading ? <Skeleton className="h-8 w-12" /> : data?.overallProgress.inProgress}</div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </Card>

        <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl mb-1">{loading ? <Skeleton className="h-8 w-12" /> : data?.overallProgress.pending}</div>
          <div className="text-sm text-muted-foreground">To Watch</div>
        </Card>

        <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-accent/5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl mb-1">{loading ? <Skeleton className="h-8 w-10" /> : `${Math.round(totalWeeklyMinutes / 60)}h`}</div>
          <div className="text-sm text-muted-foreground">This Week</div>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Learning Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="p-6 border-primary/20 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl">Time Spent Learning</h3>
              <Badge variant="outline">{loading ? '—' : `${totalWeeklyMinutes} mins this week`}</Badge>
            </div>

            <div className="space-y-6">
              {/* Bar Chart */}
              {loading ? (
                <Skeleton className="h-56 w-full" />
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" tickLine={false} axisLine={false} />
                      <Tooltip formatter={(v: any) => [`${v} min`, 'Time']} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                      <Bar dataKey="minutes" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary/10">
                <div className="text-center">
                  <div className="text-xl mb-1">{loading ? '—' : `${Math.round(totalWeeklyMinutes / (weeklyData.length || 1))}m`}</div>
                  <div className="text-xs text-muted-foreground">Daily Average</div>
                </div>
                <div className="text-center">
                  <div className="text-xl mb-1">{loading ? '—' : `${Math.max(...weeklyData.map(d => d.minutes), 0)}m`}</div>
                  <div className="text-xs text-muted-foreground">Longest Session</div>
                </div>
                <div className="text-center">
                  <div className="text-xl mb-1">{loading ? '—' : weeklyData.filter(d => d.minutes > 0).length}</div>
                  <div className="text-xs text-muted-foreground">Active Days</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Streak & Goals Column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Streak Card */}
          <Card className="p-6 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl">{loading ? '—' : `${streak} Days`}</div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Keep learning every day to maintain your streak! 🔥
            </p>
          </Card>

          {/* Daily Goal */}
          <Card className="p-6 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl">{loading ? '—' : `${data?.timeSpentLearning.avgDailyTime || 60} min`}</div>
                <div className="text-sm text-muted-foreground">Daily Goal</div>
              </div>
            </div>
            <Progress value={loading ? 0 : Math.min(100, Math.round(((weeklyData?.[weeklyData.length - 1]?.minutes || 0) / (data?.timeSpentLearning.avgDailyTime || 60)) * 100))} className="h-2 mb-2 transition-all duration-1000" />
            <p className="text-xs text-muted-foreground">
              {loading ? 'Loading…' : `${weeklyData?.[weeklyData.length - 1]?.minutes || 0} of ${data?.timeSpentLearning.avgDailyTime || 60} minutes completed today`}
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Playlist Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <Card className="p-6 border-primary/20">
          <h3 className="text-xl mb-6">Playlist Progress</h3>
          <div className="space-y-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))
              : playlists.map((playlist, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${playlist.color} flex items-center justify-center`}>
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm">{playlist.name}</div>
                      <div className="text-xs text-muted-foreground">progress</div>
                    </div>
                  </div>
                  <Badge variant="outline">{playlist.progress}%</Badge>
                </div>
                <div className="h-2 bg-muted rounded relative overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${playlist.progress}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-accent" />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Overall Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <Card className="p-6 border-primary/20">
          <h3 className="text-xl mb-4">Overall Progress</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Completion</span>
                <span className="text-primary">{loading ? '—' : `${completionRate}%`}</span>
              </div>
              <div className="h-3 bg-muted rounded relative overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${completionRate}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-accent" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary/10">
              <div className="text-center">
                <div className="text-2xl mb-1 text-green-500">{loading ? '—' : data?.overallProgress.completed}</div>
                <div className="text-xs text-muted-foreground">✓ Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1 text-blue-500">{loading ? '—' : data?.overallProgress.inProgress}</div>
                <div className="text-xs text-muted-foreground">▶ Watching</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1 text-muted-foreground">{loading ? '—' : data?.overallProgress.pending}</div>
                <div className="text-xs text-muted-foreground">○ Pending</div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6 border-primary/20">
          <h3 className="text-xl mb-6">Recent Achievements</h3>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(data?.recentAchievements || []).map((achievement, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="p-4 rounded-lg border text-center transition-all bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20"
                >
                  <div className="text-4xl mb-2">⭐</div>
                  <div className="text-sm mb-1">{achievement.title}</div>
                  <div className="text-xs text-muted-foreground">{achievement.date}</div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
