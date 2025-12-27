import { useState } from 'react';
import { createYoutubeTranscript } from '../api/transcript';
import { generateSummary } from '../api/transcript';
import { toast } from 'sonner';
import { Loader2, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// --- FIXED TIME FORMATTER (No Timezones!) ---
const formatTime = (ms) => {
  if (!ms && ms !== 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function TranscriptionSection() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const handleTranscribe = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setStatusMsg("Checking captions...");
    setData(null);

    try {
      // Long video handling: Update message after 3s
      const timer = setTimeout(() => {
        setStatusMsg("Downloading audio & using AI (This may take 1-3 mins for long videos)...");
      }, 3000);

      const res = await createYoutubeTranscript(url);
      clearTimeout(timer);

      setData(res);
      toast.success(res.source === 'ai' ? "AI Transcription Complete!" : "Transcript Loaded!");
    } catch (err) {
      console.error(err);
      toast.error(err.error || "Failed. Please try a shorter video or check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Input Form */}
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Transcribe YouTube Videos</h1>
        <p className="text-slate-400 mb-6">Enter a URL to get notes via Scraping or AI</p>
        
        <form onSubmit={handleTranscribe} className="flex gap-2 max-w-xl mx-auto">
          <input 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
          />
          <button 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5"/> : "Transcribe"}
          </button>
        </form>
        
        {loading && <p className="mt-4 text-blue-400 animate-pulse text-sm">{statusMsg}</p>}
      </div>

      {/* Results */}
      {data && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <FileText className="text-blue-500 w-5 h-5"/> 
              Transcript 
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 uppercase">
                {data.source}
              </span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {data.summary ? (
              <div className="mb-3 p-4 rounded-lg border border-purple-500/20 bg-purple-900/10 text-slate-100">
                <div className="mb-2 text-xs uppercase tracking-wide text-purple-300">Gemini Summary</div>
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold text-blue-400 mt-4" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />,
                    }}
                  >
                    {data.summary}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="mb-3">
                <button
                  disabled={loadingSummary}
                  onClick={async () => {
                    try {
                      if (!data) return;
                      // prefer videoId in cache response if present, otherwise extract from URL
                      const vidMatch = url.match(/(?:v=|\/?)([a-zA-Z0-9_-]{11})(?:&|\?|\/|$)/);
                      const videoId = vidMatch ? vidMatch[1] : null;
                      if (!videoId) {
                        toast.error('Could not extract video ID from URL');
                        return;
                      }
                      setLoadingSummary(true);
                      const res = await generateSummary(videoId);
                      setData(prev => ({ ...prev, summary: res.summary || '' }));
                    } catch (err) {
                      console.error(err);
                      toast.error(err?.error || 'Failed to generate summary');
                    } finally {
                      setLoadingSummary(false);
                    }
                  }}
                  className="px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {loadingSummary ? <><Loader2 className="w-4 h-4 animate-spin"/> Generating Summary...</> : '✨ Generate AI Summary'}
                </button>
              </div>
            )}

            {data.segments.map((seg, idx) => (
              <div key={idx} className="flex gap-4 p-3 hover:bg-slate-800/50 rounded-lg group transition-colors">
                <button className="shrink-0 w-16 text-right font-mono text-sm text-blue-400 pt-0.5 group-hover:text-blue-300">
                  {formatTime(data.source === 'scrape' ? seg.offset * 1000 : seg.offset)}
                </button>
                <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                  {seg.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}