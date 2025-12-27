// client/src/components/CustomVideoPlayer.tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, Settings } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { saveVideoProgress } from '../api/playlist';

// YouTube types on window
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  duration?: string;
  status?: string;
  progress?: number;
  sourceType: 'youtube' | 'upload';
}

interface CustomVideoPlayerProps {
  video: Video;
  playlistId: string;
  onStatusChange?: (status: string) => void;
  initialProgress?: number;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  className?: string;
}

function parseYoutubeId(url: string): string | null {
  try {
    if (!url) return null;
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.split('/')[1] || null;
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    const paths = u.pathname.split('/');
    const idx = paths.indexOf('embed');
    if (idx !== -1 && paths[idx + 1]) return paths[idx + 1];
    return null;
  } catch {
    return null;
  }
}

function ensureYoutubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();

  return new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previous) previous();
      resolve();
    };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const first = document.getElementsByTagName('script')[0];
      if (first?.parentNode) first.parentNode.insertBefore(tag, first);
      else document.head.appendChild(tag);
    }
  });
}

export function CustomVideoPlayer({
  video,
  playlistId,
  onStatusChange,
  initialProgress = 0,
  isFocusMode = false,
  onToggleFocusMode
}: CustomVideoPlayerProps) {
  // states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false); // start hidden — show only on hover
  const [playerReady, setPlayerReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const timeUpdateInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSaveTimeRef = useRef<number>(0);

  const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // minimal formatTime
  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // save progress helper
  const saveProgress = useCallback(
    async (status: 'watching' | 'paused' | 'completed') => {
      try {
        if (!ytPlayerRef.current) return;
        const ct = Math.floor(ytPlayerRef.current.getCurrentTime() || 0);
        await saveVideoProgress(playlistId, video.id, { currentTime: ct, status });
        lastSaveTimeRef.current = Date.now();
      } catch (e) {
        console.error('Error saving progress:', e);
      }
    },
    [playlistId, video.id]
  );

  // init YouTube player (unchanged lifecycle)
  useEffect(() => {
    if (video.sourceType !== 'youtube') return;
    let mounted = true;
    let playerInstance: any = null;

    const init = async () => {
      const vid = parseYoutubeId(video.url);
      console.log('CustomVideoPlayer Init:', { 
        videoUrl: video.url, 
        extractedId: vid,
        sourceType: video.sourceType 
      });
      
      if (!vid) {
        console.error('Invalid YouTube URL:', video.url);
        return;
      }

      try {
        await ensureYoutubeApi();
        if (!mounted) return;

        playerInstance = new window.YT.Player(playerRef.current, {
          height: '100%',
          width: '100%',
          videoId: vid,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 0,
            enablejsapi: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (e: any) => {
              if (!mounted) return;
              ytPlayerRef.current = e.target;
              setPlayerReady(true);
              try {
                const d = Math.floor(ytPlayerRef.current.getDuration() || 0);
                if (d > 0) setDuration(d);
              } catch {}
              if (initialProgress) {
                ytPlayerRef.current.seekTo(initialProgress, true);
                setCurrentTime(initialProgress);
              }
              try {
                ytPlayerRef.current.setVolume(volume);
                setIsMuted(volume === 0);
              } catch {}
            },
            onStateChange: (ev: any) => {
              if (!mounted) return;
              const st = ev.data;
              if (st === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                onStatusChange?.('watching');
              } else if (st === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
                saveProgress('paused');
                onStatusChange?.('paused');
              } else if (st === window.YT.PlayerState.ENDED) {
                setIsPlaying(false);
                saveProgress('completed');
                onStatusChange?.('completed');
              }
            },
            onError: (err: any) => console.error('YT error', err)
          }
        });

        timeUpdateInterval.current = setInterval(() => {
          if (!mounted || !ytPlayerRef.current) return;
          try {
            const ct = Math.floor(ytPlayerRef.current.getCurrentTime() || 0);
            const d = Math.floor(ytPlayerRef.current.getDuration() || 0);
            setCurrentTime(ct);
            if (d > 0) setDuration(d);
            if (Date.now() - lastSaveTimeRef.current > 15000) {
              saveProgress('watching');
            }
          } catch {}
        }, 1000);
      } catch (err) {
        console.error('Error init YT', err);
      }
    };

    init();

    return () => {
      mounted = false;
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
        timeUpdateInterval.current = null;
      }
      if (playerInstance?.destroy) {
        try {
          playerInstance.destroy();
        } catch {}
      }
      ytPlayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.url, video.sourceType]);

  // play/pause
  const togglePlayPause = useCallback(() => {
    if (!ytPlayerRef.current) return;
    const st = ytPlayerRef.current.getPlayerState?.();
    if (st === window.YT?.PlayerState.PLAYING) ytPlayerRef.current.pauseVideo();
    else ytPlayerRef.current.playVideo();
  }, []);

  // seek
  const handleSeek = (time: number) => {
    if (!ytPlayerRef.current) return;
    const t = Math.max(0, Math.min(time, duration || Number.MAX_SAFE_INTEGER));
    ytPlayerRef.current.seekTo(t, true);
    setCurrentTime(Math.floor(t));
    saveProgress('watching');
  };

  // volume
  useEffect(() => {
    if (!ytPlayerRef.current) return;
    try {
      if (isMuted) ytPlayerRef.current.mute();
      else {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.setVolume(volume);
      }
    } catch (e) {
      console.error(e);
    }
  }, [volume, isMuted]);

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    if (!ytPlayerRef.current) return;
    try {
      ytPlayerRef.current.setVolume(v);
      setIsMuted(v === 0);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleMute = () => {
    if (!ytPlayerRef.current) return setIsMuted(s => !s);
    try {
      if (isMuted) {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.setVolume(volume || 50);
        setIsMuted(false);
      } else {
        ytPlayerRef.current.mute();
        setIsMuted(true);
      }
    } catch {
      setIsMuted(s => !s);
    }
  };

  // fullscreen toggle (same behavior applies when fullscreen because mouseenter/mouseleave are on container)
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((e) => console.error(e));
    } else {
      document.exitFullscreen().catch((e) => console.error(e));
    }
  };

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // --- THE KEY PART: show/hide controls only while mouse is over player container ---
  // Show on mouse enter, hide on leave. This works both in normal and fullscreen.
  // Always show controls in focus mode for better UX
  useEffect(() => {
    setShowControls(true);
  }, []);

  const handleMouseEnter = () => setShowControls(true);
  const handleMouseLeave = () => setShowControls(false);

  // Render
  if (video.sourceType !== 'youtube') return <div>Unsupported video source type: {video.sourceType}</div>;
  
  if (!video.url) {
    return <div className="w-full h-full bg-black flex items-center justify-center text-red-500">
      <div className="text-center">
        <p className="mb-2">Error: No video URL provided</p>
        <p className="text-sm text-muted-foreground">Video: {video.title}</p>
      </div>
    </div>;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black rounded-lg overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // No global onMouseMove — we don't want controls toggled from outside the container
    >
      {/* YT player mount point */}
      <div ref={playerRef} className="w-full h-full" />

      {/* Controls visible only when showControls === true */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4"
          >
            {/* Progress */}
            <div className="w-full mb-2">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={(v: number[]) => handleSeek(v[0])}
                onValueCommit={(v: number[]) => handleSeek(v[0])}
                className="h-2 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-white/80 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={togglePlayPause}>
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={toggleMute}>
                    {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  <div className="w-24">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={100}
                      step={1}
                      onValueChange={(v: number[]) => handleVolumeChange(v[0])}
                      onValueCommit={(v: number[]) => handleVolumeChange(v[0])}
                      className="h-2"
                    />
                  </div>
                </div>

                <span className="text-sm text-white/80 hidden sm:inline">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>

              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center justify-center rounded-md h-10 w-10 text-white hover:bg-white/10">
                      <Settings className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700 max-h-96 overflow-y-auto">
                    <div className="px-3 py-2 text-white text-sm font-medium">Playback Speed</div>
                    <div className="grid grid-cols-4 gap-2 p-2">
                      {playbackSpeeds.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setPlaybackRate(s);
                            if (ytPlayerRef.current?.setPlaybackRate) ytPlayerRef.current.setPlaybackRate(s);
                          }}
                          className={`text-sm py-1 px-2 rounded ${playbackRate === s ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
                        >
                          {s === 1 ? 'Normal' : `${s}x`}
                        </button>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
