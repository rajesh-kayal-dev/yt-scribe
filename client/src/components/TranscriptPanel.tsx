import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Copy, Download, AlignLeft, ListOrdered, Sparkles, MessageSquare, FileText, Scissors, Highlighter, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import ReactMarkdown from 'react-markdown';
import { generateSummary } from '../api/transcript';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface TranscriptLine {
  id: number;
  time: number;
  text: string;
  speaker?: string;
}

interface TranscriptPanelProps {
  videoId: string;
  transcriptId?: string; // for AI actions
  onSeek?: (seconds: number) => void; // jump video to time
}

const mockTranscript: TranscriptLine[] = [
  { id: 1, time: 0, text: "Welcome to this comprehensive tutorial on web development." },
  { id: 2, time: 5, text: "Today we're going to explore some fundamental concepts that will help you build amazing applications." },
  { id: 3, time: 12, text: "First, let's talk about the basics of HTML and how it structures our web pages." },
  { id: 4, time: 20, text: "HTML stands for HyperText Markup Language and it's the foundation of every website." },
  { id: 5, time: 28, text: "Next, we'll dive into CSS, which allows us to style and make our pages look beautiful." },
  { id: 6, time: 35, text: "CSS provides powerful tools for layout, colors, fonts, and responsive design." },
  { id: 7, time: 43, text: "Finally, JavaScript brings interactivity to our pages, making them dynamic and engaging." },
  { id: 8, time: 52, text: "With these three technologies, you can build almost anything on the web." },
  { id: 9, time: 60, text: "Let's start with a simple example to see how they work together." },
  { id: 10, time: 68, text: "Remember, practice is key to mastering these skills." },
];

export function TranscriptPanel({ videoId, transcriptId, onSeek }: TranscriptPanelProps) {
  const [transcript, setTranscript] = useState<TranscriptLine[]>(mockTranscript);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeLineId, setActiveLineId] = useState<number | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNotes, setAiNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState<{ id: string; time: number; text: string }[]>([]);
  const [toolbar, setToolbar] = useState<{ visible: boolean; x: number; y: number; text: string; time: number | null }>({ visible: false, x: 0, y: 0, text: '', time: null });

  // Simulate video time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime((prev) => (prev + 1) % 80);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update active line based on current time
  useEffect(() => {
    const activeLine = transcript.find(
      (line, index) =>
        line.time <= currentTime &&
        (index === transcript.length - 1 || transcript[index + 1].time > currentTime)
    );
    if (activeLine) {
      setActiveLineId(activeLine.id);
    }
  }, [currentTime, transcript]);

  // Auto-scroll to active line
  useEffect(() => {
    if (autoScroll && activeLineId && transcriptRef.current) {
      const activeElement = document.getElementById(`transcript-line-${activeLineId}`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLineId, autoScroll]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyTranscript = () => {
    const text = transcript.map(line => `[${formatTime(line.time)}] ${line.text}`).join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Transcript copied to clipboard!');
  };

  const handleDownloadTranscript = () => {
    const text = transcript.map(line => `[${formatTime(line.time)}] ${line.text}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${videoId}.txt`;
    a.click();
    toast.success('Transcript downloaded!');
  };

  const filteredTranscript = transcript.filter(line =>
    line.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fullTranscriptText = transcript.map(line => line.text).join(' ');

  async function handleGenerateSummary() {
    if (!transcriptId) {
      // fallback: simple mock
      setAiLoading(true);
      setError(null);
      setTimeout(() => {
        setAiNotes('**Summary**\n\n- Key ideas extracted from transcript.\n- Add your API key to enable real summaries.');
        setAiLoading(false);
      }, 1200);
      return;
    }
    try {
      setAiLoading(true);
      setError(null);
      const res = await generateSummary(transcriptId);
      setAiNotes(res?.summary || '');
    } catch (e: any) {
      setError(e?.message || 'Failed to generate summary');
    } finally {
      setAiLoading(false);
    }
  }

  function onTranscriptMouseUp() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      setToolbar((t) => ({ ...t, visible: false, text: '' }));
      return;
    }
    const text = sel.toString().trim();
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = transcriptRef.current?.getBoundingClientRect();
    const x = (rect.left - (containerRect?.left || 0)) + (rect.width / 2);
    const y = rect.top - (containerRect?.top || 0) - 8;
    // infer time from closest line element
    let time: number | null = null;
    let node: HTMLElement | null = range.startContainer as any;
    while (node && node.id?.startsWith('transcript-line-') === false) {
      node = node.parentElement;
    }
    if (node) {
      const idStr = node.id.replace('transcript-line-', '');
      const l = transcript.find((ln) => String(ln.id) === idStr);
      time = l?.time ?? null;
    }
    if (text) setToolbar({ visible: true, x, y, text, time });
  }

  function saveSnippet() {
    if (!toolbar.text) return;
    const note = { id: `${Date.now()}`, time: toolbar.time ?? 0, text: toolbar.text };
    setUserNotes((prev) => [note, ...prev]);
    setToolbar((t) => ({ ...t, visible: false, text: '' }));
    toast.success('Snippet saved to notes');
  }

  function summarizeSnippet() {
    setAiLoading(true);
    setAiNotes(`**Snippet Summary**\n\n${toolbar.text}`);
    setTimeout(() => setAiLoading(false), 600);
  }

  function highlightSnippet() {
    // visual only: simply close toolbar
    setToolbar((t) => ({ ...t, visible: false }));
  }

  return (
    <Card className="p-0 border-primary/20 overflow-hidden">
      {/* Sticky AI Action Bar */}
      <div className="sticky top-0 z-10 backdrop-blur bg-slate-950/70 border-b border-slate-800 px-6 py-3 flex items-center gap-2">
        <div className="font-medium text-sm mr-auto">AI Actions</div>
        <Button size="sm" className="transition-all duration-300 bg-emerald-500 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30" onClick={handleGenerateSummary}>
          <Sparkles className="w-4 h-4 mr-2" />Generate Summary
        </Button>
        <Button variant="outline" size="sm" className="transition-all duration-300 border-emerald-600/40 text-emerald-300 hover:bg-emerald-600/10 hover:shadow-lg hover:shadow-emerald-500/30" onClick={() => setAiNotes(fullTranscriptText)}>
          <FileText className="w-4 h-4 mr-2" />Generate AI Notes
        </Button>
        <Button variant="outline" size="sm" className="transition-all duration-300 border-emerald-600/40 text-emerald-300 hover:bg-emerald-600/10">
          <MessageSquare className="w-4 h-4 mr-2" />AI Chat
        </Button>
        <Button variant="ghost" size="icon" className="transition-all duration-300 text-emerald-400 hover:text-emerald-300" onClick={handleDownloadTranscript}>
          <Download className="w-4 h-4" />
        </Button>
      </div>

      <Tabs defaultValue="synced" className="w-full px-6 pb-6 pt-4">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="synced" className="gap-2 text-slate-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none">
              <ListOrdered className="w-4 h-4" />
              Auto-Synced
            </TabsTrigger>
            <TabsTrigger value="full" className="gap-2 text-slate-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none">
              <AlignLeft className="w-4 h-4" />
              Full Transcript
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2 text-slate-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none">
              <FileText className="w-4 h-4" />
              User Notes
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-emerald-300 border-emerald-600/40 hover:bg-emerald-600/10" onClick={handleCopyTranscript}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" className="text-emerald-300 border-emerald-600/40 hover:bg-emerald-600/10" onClick={handleDownloadTranscript}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Auto-Synced Transcript */}
        <TabsContent value="synced" className="space-y-4">
          {/* Search & Controls */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={autoScroll} onCheckedChange={setAutoScroll} />
              <span className="text-sm">Auto-scroll</span>
            </div>
          </div>

          {/* Transcript Lines */}
          <div
            ref={transcriptRef}
            className="space-y-2 pr-2 overflow-y-auto max-h-[60vh] scrollbar-thin"
            onMouseUp={onTranscriptMouseUp}
          >
            {filteredTranscript.map((line) => (
              <motion.div
                key={line.id}
                id={`transcript-line-${line.id}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg cursor-text transition-all duration-200 border-l-4 ${
                  activeLineId === line.id
                    ? 'bg-cyan-900/20 border-cyan-400 shadow-[0_0_0_1px_rgba(8,145,178,0.2)]'
                    : 'bg-slate-800/40 hover:bg-slate-700/40 border-transparent'
                }`}
              >
                <div className="flex gap-3">
                  <button
                    className="shrink-0"
                    onClick={() => onSeek?.(line.time)}
                    title="Jump to time"
                  >
                    <Badge variant="outline" className="transition-all duration-300 text-purple-300 border-purple-400/30 hover:underline underline-offset-4">
                      {formatTime(line.time)}
                    </Badge>
                  </button>
                  <p className="text-sm leading-relaxed">{line.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredTranscript.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No matches found for "{searchQuery}"</p>
            </div>
          )}
        </TabsContent>

        {/* Full Transcript */}
        <TabsContent value="full" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search full transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="bg-accent/5 rounded-lg p-6">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {fullTranscriptText}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary/10">
            <div className="text-center">
              <div className="text-2xl mb-1">{transcript.length}</div>
              <div className="text-xs text-muted-foreground">Segments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">{fullTranscriptText.split(' ').length}</div>
              <div className="text-xs text-muted-foreground">Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">{formatTime(transcript[transcript.length - 1].time)}</div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
          </div>
        </TabsContent>

        {/* User Notes */}
        <TabsContent value="notes" className="space-y-4">
          {userNotes.length === 0 ? (
            <div className="text-sm text-muted-foreground">No notes yet. Select transcript text to save snippets.</div>
          ) : (
            <div className="space-y-3">
              {userNotes.map((n) => (
                <div key={n.id} className="p-3 rounded border border-slate-700 bg-slate-800/40">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{formatTime(n.time)}</Badge>
                    <Button size="sm" variant="ghost" className="text-emerald-300 hover:text-emerald-200" onClick={() => onSeek?.(n.time)}>Jump</Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{n.text}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Floating Selection Toolbar */}
      <AnimatePresence>
        {toolbar.visible && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute z-20"
            style={{ left: toolbar.x, top: toolbar.y }}
          >
            <div className="flex items-center gap-1 rounded-md bg-slate-700 text-emerald-300 border border-slate-600 shadow px-2 py-1">
              <Button size="sm" variant="ghost" className="h-7 px-2 text-emerald-300 hover:text-emerald-200" onClick={saveSnippet}>
                <Scissors className="w-4 h-4 mr-1" />Save Snippet
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-emerald-300 hover:text-emerald-200" onClick={summarizeSnippet}>
                <Sparkles className="w-4 h-4 mr-1" />Summarize AI
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-emerald-300 hover:text-emerald-200" onClick={highlightSnippet}>
                <Highlighter className="w-4 h-4 mr-1" />Highlight
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Notes / Summary Output */}
      {(aiLoading || aiNotes || error) && (
        <div className="border-t border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm">AI Output</span>
            {aiLoading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
          </div>
          {error && (
            <div className="text-sm text-red-400">{error}</div>
          )}
          {!error && (
            <div className="prose prose-invert max-w-none text-sm">
              {aiLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-3 bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-700 rounded w-2/3" />
                  <div className="h-3 bg-slate-700 rounded w-1/2" />
                </div>
              ) : (
                <ReactMarkdown>{aiNotes || 'No content yet.'}</ReactMarkdown>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
