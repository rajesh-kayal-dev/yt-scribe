import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Copy, ArrowLeft, Loader2 } from 'lucide-react';
import { getTranscriptById } from '../api/transcript';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

interface Props {
  transcriptId: string;
  onBack?: () => void;
}

export function TranscriptDetail({ transcriptId, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [fullText, setFullText] = useState('');
  const [segments, setSegments] = useState<Array<{ start: number; end: number; text: string }>>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getTranscriptById(transcriptId);
        if (!mounted) return;
        setTitle(data.title || 'Transcript');
        setFullText(data.fullText || '');
        setSegments(Array.isArray(data.segments) ? data.segments : []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load transcript');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [transcriptId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    toast.success('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading transcript…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Card className="p-8 border-destructive/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">Unable to load transcript</h2>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            )}
          </div>
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl">{title}</h2>
          {segments?.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">Includes timestamps</p>
          )}
        </div>
        <div className="flex gap-2">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" /> Copy
          </Button>
        </div>
      </div>

      <Card className="p-6 border-primary/20">
        <Textarea
          value={fullText}
          onChange={(e) => setFullText(e.target.value)}
          className="min-h-[420px] font-mono text-sm"
        />
      </Card>

      {segments?.length > 0 && (
        <Card className="p-6 mt-6 border-primary/20">
          <h3 className="mb-4">Segments</h3>
          <div className="max-h-[360px] overflow-auto space-y-3">
            {segments.map((s, idx) => (
              <div key={idx} className="p-3 rounded border border-muted-foreground/20">
                <div className="text-xs text-muted-foreground mb-1">
                  {s.start.toFixed(1)}s – {s.end.toFixed(1)}s
                </div>
                <div className="text-sm leading-relaxed">{s.text}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
