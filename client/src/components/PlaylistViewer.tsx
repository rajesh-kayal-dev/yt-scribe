import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Play, FileText, Download, Copy, Sparkles, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  transcribed: boolean;
}

interface Playlist {
  id: number;
  title: string;
  description: string;
  videos: Video[];
  createdAt: Date;
}

interface PlaylistViewerProps {
  playlist: Playlist;
  onBack: () => void;
}

export function PlaylistViewer({ playlist, onBack }: PlaylistViewerProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTranscribe = (video: Video) => {
    setLoading(true);
    setSelectedVideo(video);

    // Simulate transcription API call
    setTimeout(() => {
      const mockTranscription = `# ${video.title}\n\n## Introduction\n\nThis video covers essential concepts that will help you understand the topic better...\n\n## Key Points\n\n- **Point 1**: Understanding the fundamentals is crucial\n- **Point 2**: Practice makes perfect\n- **Point 3**: Build real projects to solidify learning\n\n## Main Content\n\nThe instructor begins by explaining the core concepts and then moves on to practical examples. This approach helps viewers grasp both theory and application.\n\n## Summary\n\nBy the end of this video, you should have a solid understanding of the topic and be ready to apply what you've learned in your own projects.`;
      
      setTranscription(mockTranscription);
      video.transcribed = true;
      setLoading(false);
      toast.success('Transcription completed!');
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcription);
    toast.success('Copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([transcription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedVideo?.title || 'transcription'}.txt`;
    a.click();
    toast.success('Downloaded!');
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Playlists
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {playlist.title}
            </h1>
            <p className="text-muted-foreground">{playlist.description}</p>
          </div>
          <Badge variant="secondary" className="bg-primary/10">
            {playlist.videos.length} videos
          </Badge>
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Video List - Left Sidebar */}
        <div className="lg:col-span-2">
          <Card className="p-4 border-primary/20 sticky top-24 max-h-[calc(100vh-200px)] overflow-y-auto">
            <h3 className="mb-4">Playlist Videos</h3>
            <div className="space-y-3">
              {playlist.videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    setSelectedVideo(video);
                    if (video.transcribed) {
                      handleTranscribe(video);
                    }
                  }}
                  className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedVideo?.id === video.id
                      ? 'bg-primary/10 border-2 border-primary/30'
                      : 'bg-accent/5 hover:bg-accent/10 border-2 border-transparent'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-24 h-16 flex-shrink-0 rounded overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2 mb-1">{video.title}</p>
                    <Badge
                      variant={video.transcribed ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {video.transcribed ? (
                        <>
                          <FileText className="w-3 h-3 mr-1" />
                          Transcribed
                        </>
                      ) : (
                        'Not transcribed'
                      )}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Transcription Area - Right Side */}
        <div className="lg:col-span-3">
          {selectedVideo ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 border-primary/20">
                {/* Video Header */}
                <div className="mb-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl mb-2">{selectedVideo.title}</h2>
                      <a
                        href={selectedVideo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {selectedVideo.url}
                      </a>
                    </div>
                    {!loading && !transcription && (
                      <Button
                        onClick={() => handleTranscribe(selectedVideo)}
                        className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Transcribe
                      </Button>
                    )}
                  </div>

                  {/* Video Thumbnail */}
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
                    <img
                      src={selectedVideo.thumbnail}
                      alt={selectedVideo.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transcription Content */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground">Generating transcription...</p>
                  </div>
                ) : transcription ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg">Transcription</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={transcription}
                      onChange={(e) => setTranscription(e.target.value)}
                      className="min-h-[500px] font-mono text-sm"
                    />
                  </>
                ) : (
                  <div className="text-center py-20">
                    <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl mb-2 text-muted-foreground">
                      No transcription yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Click the "Transcribe" button to generate notes for this video
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Play className="w-20 h-20 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-2xl mb-2 text-muted-foreground">
                Select a video to get started
              </h3>
              <p className="text-muted-foreground">
                Choose a video from the playlist to view or transcribe it
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
