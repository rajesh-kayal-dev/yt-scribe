import { useState } from 'react';
import { motion } from 'motion/react';
import { Youtube, Download, Copy, Sparkles, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { createYoutubeTranscript } from '../api/transcript';

interface Props {
  setActiveSection?: (section: any) => void;
  setTranscriptId?: (id: string) => void;
}

export function TranscriptionSection({ setActiveSection, setTranscriptId }: Props) {
  const [url, setUrl] = useState('');
  const [withTimestamps, setWithTimestamps] = useState(false);
  const [loading, setLoading] = useState(false);
  const [longHint, setLongHint] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [segments, setSegments] = useState<{ text: string; start: number; duration: number }[] | null>(null);

  const handleTranscribe = async () => {
    if (!url) {
      toast.error('Please enter a YouTube URL');
      return;
    }
    try {
      setLoading(true);
      setLongHint(false);
      setSegments(null);
      const hintTimer = setTimeout(() => setLongHint(true), 3000);
      const res = await createYoutubeTranscript(url, withTimestamps);
      setVideoTitle(res.title || 'Transcript');
      setTranscription(res.fullText || res.transcript || '');
      if (Array.isArray(res.segments) && res.segments.length) {
        setSegments(res.segments);
      }
      if (res.transcriptId && setActiveSection && setTranscriptId) {
        setTranscriptId(res.transcriptId);
        setActiveSection('transcript-detail');
      } else {
        toast.success('Transcription completed!');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to transcribe video');
    } finally {
      setLoading(false);
      setLongHint(false);
    }
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
    a.download = 'transcription.txt';
    a.click();
    toast.success('Downloaded!');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Transcribe YouTube Videos
        </h1>
        <p className="text-muted-foreground text-lg">
          Paste any YouTube URL and get AI-powered notes in seconds
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-8 mb-8 border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-12 h-12"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={withTimestamps} onChange={(e) => setWithTimestamps(e.target.checked)} />
              With timestamps
            </label>
            <Button
              onClick={handleTranscribe}
              disabled={loading}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white h-12 px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {longHint ? 'Captions unavailable, generating with AI…' : 'Transcribing… this may take a minute'}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Transcribe
                </>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Results Section */}
      {(transcription || (segments && segments.length)) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 border-primary/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl">{videoTitle}</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleDownload}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {segments && segments.length ? (
              <div className="max-h-[420px] overflow-y-auto space-y-3 pr-2">
                {segments.map((s, idx) => (
                  <div key={idx} className="p-3 rounded-md bg-accent/10 border border-accent/20">
                    <div className="text-xs text-muted-foreground mb-1">{new Date(s.start * 1000).toISOString().substr(11, 8)} • {Math.round(s.duration)}s</div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{s.text}</div>
                  </div>
                ))}
              </div>
            ) : (
              <Textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="Your transcription will appear here..."
              />
            )}
          </Card>
        </motion.div>
      )}

      {/* Info Cards */}
      {!transcription && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-6 mt-12"
        >
          {[
            { title: 'Fast Processing', desc: 'Get results in seconds' },
            { title: 'AI-Powered', desc: 'Advanced language models' },
            { title: 'Export Ready', desc: 'Download or copy instantly' },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-6 rounded-xl bg-accent/10 border border-accent/20"
            >
              <h3 className="mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
