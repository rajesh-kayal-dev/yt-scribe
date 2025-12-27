import { motion } from 'motion/react';
import { Play, CheckCircle2, Clock, Eye, Trash2 } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  channel: string;
  status: 'completed' | 'watching' | 'towatch';
  progress: number;
}

interface VideoListProps {
  videos: Video[];
  selectedVideo: Video | null;
  onSelectVideo: (video: Video) => void;
  sortBy: string;
  filterBy: string;
  onDeleteVideo?: (videoId: string) => void;
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  watching: {
    icon: Eye,
    label: 'Watching',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  towatch: {
    icon: Clock,
    label: 'To Watch',
    color: 'text-muted-foreground',
    bgColor: 'bg-accent/10',
  },
};

export function VideoList({ videos, selectedVideo, onSelectVideo, sortBy, filterBy, onDeleteVideo }: VideoListProps) {
  // Filter videos
  let filteredVideos = videos;
  if (filterBy !== 'all') {
    filteredVideos = videos.filter(v => v.status === filterBy);
  }

  // Sort videos
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    switch (sortBy) {
      case 'duration':
        return parseInt(a.duration) - parseInt(b.duration);
      case 'completed':
        return a.status === 'completed' ? -1 : 1;
      case 'newest':
        return parseInt(b.id) - parseInt(a.id);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
      {sortedVideos.map((video, index) => {
        const StatusIcon = statusConfig[video.status].icon;
        const isSelected = selectedVideo?.id === video.id;

        return (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 4 }}
          >
            <Card
              onClick={() => onSelectVideo(video)}
              className={`p-3 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-primary/10 border-2 border-primary/50 shadow-lg'
                  : 'hover:bg-accent/5 border-2 border-transparent hover:border-accent/20'
              }`}
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-accent/10">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  {/* Duration Badge */}
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-xs text-white">
                    {video.duration}
                  </div>
                </div>

                {/* Video Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <h4 className="line-clamp-2 text-sm leading-tight">{video.title}</h4>
                  
                  <p className="text-xs text-muted-foreground truncate">{video.channel}</p>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusConfig[video.status].bgColor} ${statusConfig[video.status].color}`}>
                      <StatusIcon className="w-3 h-3" />
                      <span>{statusConfig[video.status].label}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {video.progress > 0 && (
                    <div className="space-y-1">
                      <Progress value={video.progress} className="h-1" />
                      <span className="text-xs text-muted-foreground">{video.progress}% complete</span>
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                {onDeleteVideo && (
                  <div className="flex items-start justify-end flex-shrink-0">
                    <button
                      className="text-slate-500 hover:text-red-500 transition-colors p-2 hover:bg-slate-800 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteVideo(video.id);
                      }}
                      aria-label="Remove video from playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}

      {sortedVideos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No videos found with the current filters</p>
        </div>
      )}
    </div>
  );
}
