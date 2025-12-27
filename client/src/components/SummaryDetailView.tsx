import { useEffect, useState } from 'react';
import { 
  Share2, 
  Copy, 
  Download, 
  Bookmark, 
  MoreHorizontal,
  FileText,
  List,
  ChevronDown,
  ChevronUp,
  Play,
  ArrowLeft
} from 'lucide-react';
import { CustomVideoPlayer } from './CustomVideoPlayer';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { getTranscriptById } from '../api/transcript';
import { generatePlaylistVideoNotes } from '../api/playlist';
import { createNote } from '../api/note';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface SummaryDetailViewProps {
  transcriptId: string;
  videoUrl: string;
  onBack?: () => void;
}

export function SummaryDetailView({ transcriptId, videoUrl, onBack }: SummaryDetailViewProps) {
  const [activeView, setActiveView] = useState<'transcript' | 'chapter'>('chapter');
  const [title, setTitle] = useState('');
  const [fullText, setFullText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [segments, setSegments] = useState<Array<{ start?: number; end?: number; offset?: number; duration?: number; text: string }>>([]);
  const [aiNotes, setAiNotes] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getTranscriptById(transcriptId);
        if (!mounted) return;
        setTitle(data.title || 'Transcript');
        // API returns `transcript` as the full text field
        setFullText(data.transcript || '');
        if (Array.isArray(data.segments)) {
          setSegments(data.segments);
        } else {
          setSegments([]);
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load transcript');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [transcriptId]);

  const extractYouTubeId = (input: string): string | null => {
    const match = input.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:&|\?|\/|$)/);
    return match ? match[1] : null;
  };

  const handleGenerateAiNotes = async () => {
    const id = extractYouTubeId(videoUrl);
    if (!id) {
      toast.error('Could not extract video ID for AI notes');
      return;
    }

    try {
      setAiLoading(true);
      setAiError(null);
      const res = await generatePlaylistVideoNotes({ videoId: id });
      const content = (res?.notes || '').trim();
      if (!content) {
        toast.error('AI did not return any notes');
        return;
      }
      setAiNotes(content);
      setActiveView('chapter');
      toast.success('AI notes generated');
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || 'Failed to generate AI notes';
      setAiError(msg);
      toast.error(msg);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAiNotes = async () => {
    if (!aiNotes.trim()) {
      toast.error('No AI notes to save yet');
      return;
    }

    const defaultTitle = title || 'AI Notes';
    const enteredTitle = window.prompt('Enter a title for your note:', defaultTitle) || '';
    const trimmedTitle = enteredTitle.trim();
    if (!trimmedTitle) {
      toast.error('Title is required to save notes');
      return;
    }

    const enteredDescription = window.prompt('Enter a short description (optional):', '') || '';
    const videoId = extractYouTubeId(videoUrl) || undefined;

    try {
      await createNote({
        title: trimmedTitle,
        description: enteredDescription.trim() || undefined,
        content: aiNotes,
        isAIGenerated: true,
        videoId,
        tags: ['AI-generated', 'summary'],
      });
      toast.success('AI notes saved to Notes Center');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to save notes');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
              onClick={onBack}
            >
              <ArrowLeft size={18} className="text-gray-700" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Share2 size={16} />
              Share
            </button>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button className="px-3 py-1.5 hover:bg-white rounded transition-colors">
                Dark
              </button>
              <button className="px-3 py-1.5 bg-white rounded transition-colors shadow-sm">
                Light
              </button>
            </div>
            <button className="px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
              English
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Side - Video Player */}
          <div>
            <div className="bg-black rounded-lg overflow-hidden aspect-video mb-4 relative group">
              <CustomVideoPlayer
                video={{
                  id: transcriptId,
                  title: title || 'Video',
                  url: videoUrl,
                  sourceType: 'youtube',
                }}
                playlistId="single-video"
              />
            </div>

            {/* Video Controls */}
            <div className="flex items-center gap-4 mb-6">
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <FileText size={20} />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <List size={20} />
              </button>
              <div className="flex-1"></div>
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <Copy size={20} />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <Download size={20} />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <Bookmark size={20} />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>

            {/* YouTube Transcript View under the player */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 mt-4 max-h-[360px] overflow-y-auto">
              <p className="text-sm text-gray-600 mb-3">YouTube Transcript</p>
              {loading && (
                <p className="text-sm text-gray-500">Loading transcript…</p>
              )}
              {!loading && error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              {!loading && !error && segments && segments.length > 0 && (
                <div className="space-y-2 text-sm">
                  {segments.map((seg, idx) => {
                    const startMs = typeof seg.offset === 'number'
                      ? seg.offset
                      : typeof seg.start === 'number'
                        ? seg.start * 1000
                        : 0;
                    const totalSeconds = Math.floor(startMs / 1000);
                    const mins = Math.floor(totalSeconds / 60);
                    const secs = totalSeconds % 60;
                    const ts = `${mins}:${secs.toString().padStart(2, '0')}`;
                    return (
                      <div key={idx} className="flex gap-3 p-2 rounded hover:bg-gray-50">
                        <span className="text-xs text-blue-600 mt-0.5 min-w-[42px] text-right">{ts}</span>
                        <p className="text-gray-800 leading-relaxed">{seg.text}</p>
                      </div>
                    );
                  })}
                </div>
              )}
              {!loading && !error && (!segments || segments.length === 0) && fullText && (
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{fullText}</p>
              )}
            </div>
          </div>

          {/* Right Side - Summary */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Summary Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                    onClick={handleGenerateAiNotes}
                    disabled={aiLoading}
                  >
                    <FileText size={16} />
                    {aiLoading ? 'Generating…' : 'AI Notes'}
                  </button>
                  <button
                    className="px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                    onClick={handleSaveAiNotes}
                    disabled={!aiNotes.trim()}
                  >
                    <Bookmark size={16} />
                    Save to Notes
                  </button>
                  <button className="px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                    <FileText size={16} />
                    AI Chat
                  </button>
                  <div className="ml-auto flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Copy size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Download size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Bookmark size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
                <h2 className="mb-4">
                  {title || 'Transcript Details'}
                </h2>
              </div>

              {/* View Toggle */}
              <div className="px-6 py-3 border-b border-gray-200 flex gap-4">
                <button
                  onClick={() => setActiveView('transcript')}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    activeView === 'transcript'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Transcript
                </button>
                <button
                  onClick={() => setActiveView('chapter')}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    activeView === 'chapter'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Chapter
                </button>
              </div>

              {/* Summary Content / Transcript / AI Notes */}
              <div className="p-6 max-h-[600px] overflow-y-auto">
                <Card className="p-4 border-primary/20">
                  {activeView === 'transcript' ? (
                    <>
                      {loading && <p className="text-sm text-gray-500">Loading transcript…</p>}
                      {!loading && error && <p className="text-sm text-red-500">{error}</p>}
                      {!loading && !error && (
                        <Textarea
                          value={fullText}
                          onChange={(e) => setFullText(e.target.value)}
                          className="min-h-[420px] font-mono text-sm"
                        />
                      )}
                    </>
                  ) : (
                    <>
                      {aiLoading && <p className="text-sm text-gray-500">Generating AI notes…</p>}
                      {!aiLoading && aiError && (
                        <p className="text-sm text-red-500">{aiError}</p>
                      )}
                      {!aiLoading && !aiError && aiNotes && (
                        <div className="prose prose-sm max-w-none min-h-[420px]">
                          <ReactMarkdown
                            components={{
                              h1: (props) => <h1 className="text-xl font-semibold mb-3" {...props} />,
                              h2: (props) => <h2 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                              h3: (props) => <h3 className="text-base font-semibold mt-3 mb-1" {...props} />,
                              p:  (props) => <p className="mb-2 leading-relaxed" {...props} />,
                              ul: (props) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                              ol: (props) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                              li: (props) => <li className="leading-relaxed" {...props} />,
                              table: (props: any) => (
                                <div className="overflow-x-auto mb-3">
                                  <table className="min-w-full text-sm" {...props} />
                                </div>
                              ),
                              code: (props: any) => (
                                <code
                                  className={
                                    (props as any).inline
                                      ? 'px-1 py-0.5 rounded bg-black/10 text-xs'
                                      : 'block p-2 rounded bg-black/10 text-xs whitespace-pre-wrap'
                                  }
                                  {...props}
                                />
                              ),
                            }}
                          >
                            {aiNotes}
                          </ReactMarkdown>
                        </div>
                      )}
                      {!aiLoading && !aiError && !aiNotes && (
                        <p className="text-sm text-gray-500 min-h-[420px] flex items-center">
                          Click "AI Notes" above to generate structured notes from this transcript.
                        </p>
                      )}
                    </>
                  )}
                </Card>
              </div>
            </div>

            {/* Additional Info Table */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm text-gray-600">Type</th>
                    <th className="px-6 py-3 text-left text-sm text-gray-600">Description</th>
                    <th className="px-6 py-3 text-left text-sm text-gray-600">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm">Transcript</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Full text generated from the YouTube video</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Copy or edit the transcript for your notes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
