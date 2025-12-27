import { useEffect, useMemo, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Filter, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { VideoList } from './VideoList';
import { CustomVideoPlayer } from './CustomVideoPlayer';
import { VideoDetails } from './VideoDetails';
import { TranscriptPanel } from './TranscriptPanel';
import { NotesPanel } from './NotesPanel.tsx';
import { LearningAnalytics } from './LearningAnalytics';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { getPlaylist, addVideo, updateVideoStatus, removeVideo } from '../api/playlist';
import { toast } from 'sonner';
import { Input } from './ui/input';

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  channel: string;
  status: 'completed' | 'watching' | 'towatch';
  progress: number;
  sourceType: 'youtube' | 'upload';
}

interface BackendVideo {
  _id: string;
  title: string;
  youtubeUrl: string;
  videoId?: string;
  duration?: number;
  order?: number;
  status: 'not_started' | 'watching' | 'completed';
  thumbnailUrl?: string;
}

interface BackendPlaylist {
  _id: string;
  title: string;
  description?: string;
  progress: number;
  videos: BackendVideo[];
}

interface EnhancedPlaylistViewerProps {
  playlistId: string;
  onBack: () => void;
}

export function EnhancedPlaylistViewer({ playlistId, onBack }: EnhancedPlaylistViewerProps) {
  const [backendPlaylist, setBackendPlaylist] = useState(null as any);
  const [selectedVideo, setSelectedVideo] = useState(null as any);
  const [sortBy, setSortBy] = useState('order');
  const [filterBy, setFilterBy] = useState('all');
  const [activeTab, setActiveTab] = useState('details' as any);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const prevCollapsedRef = useRef<boolean>(false);

  const loadPlaylist = async () => {
    try {
      const data = await getPlaylist(playlistId);
      setBackendPlaylist(data.playlist);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load playlist');
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!backendPlaylist) return;
    const yes = window.confirm('Remove this video from the playlist?');
    if (!yes) return;
    // optimistic update
    const prev = backendPlaylist;
    const next = {
      ...prev,
      videos: (prev.videos || []).filter((v: any) => v._id !== videoId && v.id !== videoId),
    };
    setBackendPlaylist(next);
    if (selectedVideo && (selectedVideo.id === videoId)) {
      setSelectedVideo(null as any);
    }
    try {
      await removeVideo(prev._id, videoId);
      toast.success('Video removed');
      // reload to ensure server state consistency
      const data = await getPlaylist(prev._id);
      setBackendPlaylist(data.playlist);
    } catch (e: any) {
      // revert on failure
      setBackendPlaylist(prev);
      toast.error(e.message || 'Failed to remove video');
    }
  };

  useEffect(() => {
    loadPlaylist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistId]);

  // Auto-hide global header when a video is active (distraction-free)
  useEffect(() => {
    const cls = 'player-active';
    if (selectedVideo) {
      document.body.classList.add(cls);
    } else {
      document.body.classList.remove(cls);
    }
    return () => document.body.classList.remove(cls);
  }, [selectedVideo]);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsLeft((s) => {
          if (s > 0) return s - 1;
          const nextIsBreak = !isBreak;
          setIsBreak(nextIsBreak);
          return (nextIsBreak ? breakMinutes : workMinutes) * 60;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isBreak, workMinutes, breakMinutes]);

  useEffect(() => {
    if (isFocusMode) {
      // entering focus mode: remember current sidebar state and force collapse
      prevCollapsedRef.current = isSidebarCollapsed;
      setIsSidebarCollapsed(true);
      document.body.classList.add('focus-mode');
      // do not reset timer; preserve current remaining seconds
    } else {
      document.body.classList.remove('focus-mode');
      setIsTimerRunning(false);
      // restore previous sidebar state
      setIsSidebarCollapsed(prevCollapsedRef.current);
    }
    return () => document.body.classList.remove('focus-mode');
  }, [isFocusMode, isBreak, workMinutes, breakMinutes]);

  // Fullscreen tracking and keyboard shortcut (desktop)
  useEffect(() => {
    const onFsChange = () => {
      const el = fullscreenRef.current;
      if (el) {
        if (document.fullscreenElement === el) {
          el.classList.add('is-fullscreen');
        } else {
          el.classList.remove('is-fullscreen');
        }
      }
      if (!document.fullscreenElement && isFocusMode) {
        // If user exited fullscreen via Esc, leave focus mode layout
        setIsFocusMode(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'f' || e.key === 'F') && selectedVideo) {
        e.preventDefault();
        handleToggleFocus(true);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      window.removeEventListener('keydown', onKey);
    };
  }, [isFocusMode, selectedVideo]);

  const requestFullscreenSafe = async () => {
    try {
      if (fullscreenRef.current && !document.fullscreenElement && window.innerWidth > 900) {
        await fullscreenRef.current.requestFullscreen();
        fullscreenRef.current.classList.add('is-fullscreen');
      }
    } catch (err) {
      // Graceful fallback: log for devs; overlay focus mode still applies
      console.warn('Fullscreen request was blocked or failed:', err);
    }
  };

  const exitFullscreenSafe = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      if (fullscreenRef.current) fullscreenRef.current.classList.remove('is-fullscreen');
    } catch (err) {
      // ignore
    }
  };

  const handleToggleFocus = async (fromKeyboard = false) => {
    if (!isFocusMode) {
      setIsFocusMode(true);
      // Only attempt fullscreen on user gesture (click or keydown)
      await requestFullscreenSafe();
    } else {
      setIsFocusMode(false);
      await exitFullscreenSafe();
    }
  };

  const mappedVideos: Video[] = useMemo(() => {
    if (!backendPlaylist) return [];
    const toLabel = (s: BackendVideo['status']): Video['status'] => {
      if (s === 'completed') return 'completed';
      if (s === 'watching') return 'watching';
      return 'towatch';
    };
    const toDuration = (n?: number) => {
      if (!n || n <= 0) return '0:00';
      const m = Math.floor(n / 60);
      const s = n % 60;
      return `${m}:${String(s).padStart(2, '0')}`;
    };
    return [...backendPlaylist.videos]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((v) => {
        // Ensure we have a valid YouTube URL
        let url = v.youtubeUrl || '';
        // If youtubeVideoId exists but URL doesn't, construct the URL
        if (!url && (v.youtubeVideoId || v.videoId)) {
          const videoId = v.youtubeVideoId || v.videoId;
          url = `https://www.youtube.com/watch?v=${videoId}`;
        }
        return {
          id: v._id,
          title: v.title,
          url,
          thumbnail: v.thumbnailUrl || (v.videoId ? `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg` : ''),
          duration: toDuration(v.duration),
          channel: '',
          status: toLabel(v.status),
          progress: v.status === 'completed' ? 100 : 0,
          sourceType: 'youtube' as const,
        };
      });
  }, [backendPlaylist]);

  // Calculate playlist statistics
  const completedCount = mappedVideos.filter(v => v.status === 'completed').length;
  const watchingCount = mappedVideos.filter(v => v.status === 'watching').length;
  const toWatchCount = mappedVideos.filter(v => v.status === 'towatch').length;
  const progressPercentage = backendPlaylist?.progress ?? (mappedVideos.length ? Math.round((completedCount / mappedVideos.length) * 100) : 0);

  const handleAddVideo = async () => {
    if (!backendPlaylist) return;
    if (!newTitle.trim() || !newUrl.trim()) {
      toast.error('Provide title and video link');
      return;
    }
    try {
      setLoading(true);
      const data = await addVideo(backendPlaylist._id, { title: newTitle.trim(), youtubeUrl: newUrl.trim() });
      setBackendPlaylist(data.playlist);
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewUrl('');
      toast.success('Video added');
    } catch (e: any) {
      toast.error(e.message || 'Failed to add video');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!backendPlaylist || !selectedVideo) return;
    try {
      setLoading(true);
      const data = await updateVideoStatus(backendPlaylist._id, selectedVideo.id, 'completed');
      setBackendPlaylist(data.playlist);
      toast.success('Marked as completed');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen playlist-viewer-root ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Header (hidden when a video is selected for distraction-free viewing) */}
      {!selectedVideo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-primary/10 bg-card/50 backdrop-blur-sm sticky top-16 z-40"
        >
          <div className="w-full px-4 py-6">
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Playlists
            </Button>

            <div className="flex items-start justify-between gap-6">
              {/* Left: Playlist Info */}
              <div className="flex-1">
                <h1 className="text-4xl mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {backendPlaylist?.title || 'Playlist'}
                </h1>
                <p className="text-muted-foreground mb-4">{backendPlaylist?.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{mappedVideos.length} videos</span>
                  <span>•</span>
                  <span>{completedCount} completed</span>
                  <span>•</span>
                  <span>{watchingCount} in progress</span>
                </div>
              </div>

              {/* Right: Progress Circle */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-accent/20"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="var(--primary)" />
                          <stop offset="100%" stopColor="var(--accent)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {progressPercentage}%
                      </span>
                      <span className="text-xs text-muted-foreground">Complete</span>
                    </div>
                  </div>
                </div>

                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white" onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Video
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="w-full px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar: Video List */}
          <div className="w-96 flex-shrink-0 playlist-sidebar">
            <div className={`${'sticky'} ${selectedVideo ? 'top-4' : 'top-40'}`}>
              {/* Filters */}
              <div className="flex gap-2 mb-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">Default Order</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="completed">Completed First</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Videos</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="watching">Watching</SelectItem>
                    <SelectItem value="towatch">To Watch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <VideoList
                videos={mappedVideos}
                selectedVideo={selectedVideo}
                onSelectVideo={setSelectedVideo}
                sortBy={sortBy}
                filterBy={filterBy}
                onDeleteVideo={handleDeleteVideo}
              />
            </div>
          </div>

          {/* Right: Video Player & Tabs */}
          <div className="flex-1 min-w-0">
            {selectedVideo ? (
              <div ref={fullscreenRef} className={isFocusMode ? 'fixed inset-0 z-50 bg-black flex flex-col' : ''}>
                {isFocusMode ? (
                  // FOCUS MODE - ENHANCED DESIGN
                  <>
                    {/* Premium Header with Integrated Timer */}
                    <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-gradient-to-r from-black via-black/95 to-black backdrop-blur-md">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                          className="text-white/60 hover:text-white transition-colors"
                          title={isSidebarCollapsed ? 'Show playlist' : 'Hide playlist'}
                        >
                          {isSidebarCollapsed ? (
                            <ChevronRight className="w-5 h-5" />
                          ) : (
                            <ChevronLeft className="w-5 h-5" />
                          )}
                        </Button>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-white font-semibold truncate text-base">{selectedVideo?.title}</h2>
                          <p className="text-white/40 text-xs">Focus Mode</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 ml-4">
                        {/* Timer Display & Controls */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-center px-4 py-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                            <div className="text-white/60 text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
                              <motion.span animate={{ opacity: isTimerRunning ? [0.5, 1, 0.5] : 1 }} transition={{ duration: 2, repeat: Infinity }}>
                                {isBreak ? '🌟' : '🎯'}
                              </motion.span>
                              {isBreak ? 'Break' : 'Focus'}
                            </div>
                            <div className="text-2xl font-mono font-bold text-primary tracking-tight">
                              {Math.floor(secondsLeft / 60).toString().padStart(2, '0')}:{(secondsLeft % 60).toString().padStart(2, '0')}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              className="h-7 px-2 text-xs bg-primary hover:bg-primary/90 text-white"
                              onClick={() => setIsTimerRunning((r: boolean) => !r)}
                              title={isTimerRunning ? 'Pause Timer' : 'Start Timer'}
                            >
                              {isTimerRunning ? '⏸' : '▶'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs border-white/20 text-white hover:bg-white/10"
                              onClick={() => { setIsTimerRunning(false); setSecondsLeft((isBreak ? breakMinutes : workMinutes) * 60); }}
                              title="Reset Timer"
                            >
                              🔄
                            </Button>
                          </div>
                        </div>

                        {/* Timer Settings - Compact */}
                        <div className="flex gap-3 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2">
                            <label className="text-white/50 text-xs">Work:</label>
                            <input
                              type="number"
                              className="w-12 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white font-semibold focus:outline-none focus:border-primary/50"
                              value={workMinutes}
                              onChange={(e) => setWorkMinutes(Math.max(1, parseInt(e.target.value || '1', 10)))}
                              min="1"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-white/50 text-xs">Break:</label>
                            <input
                              type="number"
                              className="w-12 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white font-semibold focus:outline-none focus:border-primary/50"
                              value={breakMinutes}
                              onChange={(e) => setBreakMinutes(Math.max(1, parseInt(e.target.value || '1', 10)))}
                              min="1"
                            />
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFocus(false)}
                          className="text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                          title="Exit Focus Mode"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="flex-1 flex overflow-hidden min-h-0">
                      {/* Left: Video Player */}
                      <div className="flex-1 flex flex-col bg-black p-6 gap-4">
                        <div className="bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5 aspect-video max-h-[55vh]">
                          <CustomVideoPlayer video={selectedVideo} playlistId={playlistId} />
                        </div>
                        
                        {/* Video Info Card Below Player */}
                        <div className="bg-gradient-to-r from-white/5 to-white/[2%] rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Playing from</p>
                              <p className="text-white font-medium">{backendPlaylist?.title}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Progress</p>
                              <p className="text-primary font-bold text-lg">{progressPercentage}%</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Transcript (single mode) */}
                      <aside className="w-96 bg-gradient-to-br from-white/5 to-white/[2%] border-l border-white/10 flex flex-col overflow-hidden" aria-label="Transcript">
                        <div className="px-4 pt-6 pb-2 border-b border-white/10">
                          <h3 className="text-sm font-semibold text-white/90">📝 Transcript</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                          <div className="space-y-3">
                            {/* Use the existing TranscriptPanel which renders transcript lines and search */}
                            <TranscriptPanel videoId={selectedVideo.id} />
                          </div>
                        </div>
                      </aside>
                    </div>

                  </>
                ) : (
                  // NORMAL MODE
                  <>
                    <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                      <CustomVideoPlayer video={selectedVideo} playlistId={playlistId} />
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h2 className="text-xl">{backendPlaylist?.title}</h2>
                          {backendPlaylist?.description && (
                            <p className="text-sm text-muted-foreground">
                              {backendPlaylist.description.split(' ').slice(0, 50).join(' ')}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>Total: {mappedVideos.length}</span>
                            <span>•</span>
                            <span>Completed: {completedCount}</span>
                            <span>•</span>
                            <span>Progress: {progressPercentage}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleToggleFocus(false)}
                            aria-pressed={isFocusMode}
                            aria-expanded={isFocusMode}
                            title={isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}
                          >
                            {isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}
                          </Button>
                          <Button onClick={handleMarkCompleted} disabled={loading}>
                            Mark as completed
                          </Button>
                        </div>
                      </div>

                      <div className="border-b border-primary/10">
                        <div className="flex gap-1">
                          {[
                            { id: 'transcript', label: '📝 Transcript' },
                            { id: 'notes', label: '📌 Notes' },
                            { id: 'details', label: 'ℹ️ Details' },
                            { id: 'analytics', label: '📊 Analytics' },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as any)}
                              className={`px-4 py-3 transition-all relative text-sm ${
                                activeTab === tab.id
                                  ? 'text-primary font-medium'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {tab.label}
                              {activeTab === tab.id && (
                                <motion.div
                                  layoutId="activeTabUnderline"
                                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent rounded-t-full"
                                />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-black/30 rounded-lg p-4 border border-primary/10 backdrop-blur-sm">
                        {activeTab === 'details' && <VideoDetails video={selectedVideo} />}
                        {activeTab === 'transcript' && <TranscriptPanel videoId={selectedVideo.id} />}
                        {activeTab === 'notes' && <NotesPanel videoId={selectedVideo.id} />}
                        {activeTab === 'analytics' && backendPlaylist && <LearningAnalytics playlist={{
                          id: 0,
                          title: backendPlaylist.title,
                          description: backendPlaylist.description || '',
                          videos: mappedVideos,
                          totalProgress: backendPlaylist.progress,
                        }} />}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-[600px] text-center"
              >
                <BarChart3 className="w-20 h-20 text-muted-foreground/50 mb-4" />
                <h3 className="text-2xl mb-2 text-muted-foreground">
                  Select a video to start learning
                </h3>
                <p className="text-muted-foreground">
                  Choose a video from the list to begin your learning journey
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsAddModalOpen(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-primary/20 rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg mb-4">Add Video</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm">Video Title</label>
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Awesome video" />
              </div>
              <div>
                <label className="text-sm">Video Link</label>
                <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button onClick={handleAddVideo} disabled={loading}>
                  {loading ? 'Adding...' : 'Add'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
