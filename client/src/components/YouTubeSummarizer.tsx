import { useState } from 'react';
import { Youtube, Video, Headphones, FileText, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { createYoutubeTranscript } from '../api/transcript';
import { AudioSummarizer } from './AudioSummarizer';

interface YouTubeSummarizerProps {
  setActiveSection?: (section: any) => void;
  setTranscriptId?: (id: string) => void;
  setVideoUrl?: (url: string) => void;
}

export function YouTubeSummarizer({ setActiveSection, setTranscriptId, setVideoUrl }: YouTubeSummarizerProps) {
  const [activeTab, setActiveTab] = useState<'youtube' | 'video' | 'audio'>('youtube');
  const [links, setLinks] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  const addMoreLink = () => {
    setLinks([...links, '']);
  };

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const extractYouTubeId = (input: string): string | null => {
    if (!input) return null;
    const match = input.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:&|\?|\/|$)/);
    return match ? match[1] : (input.length === 11 ? input : null);
  };

  const handleGenerateSummary = async () => {
    const validLinks = links.filter((link) => link.trim());
    if (!validLinks.length) {
      toast.error('Please paste at least one YouTube link');
      return;
    }

    const url = validLinks[0];
    const videoId = extractYouTubeId(url);
    if (!videoId) {
      toast.error('Could not extract video ID from URL');
      return;
    }

    try {
      setLoading(true);
      await createYoutubeTranscript(url);

      if (setActiveSection && setTranscriptId) {
        setTranscriptId(videoId);
        if (setVideoUrl) {
          setVideoUrl(url);
        }
        setActiveSection('summary-detail');
      } else {
        toast.success('Transcription completed!');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const exampleVideos = [
    'figma:asset/45fe781c31db21d0700a5c8b08ebe6c3b04bc44e.png',
    'figma:asset/45fe781c31db21d0700a5c8b08ebe6c3b04bc44e.png',
    'figma:asset/45fe781c31db21d0700a5c8b08ebe6c3b04bc44e.png',
    'figma:asset/45fe781c31db21d0700a5c8b08ebe6c3b04bc44e.png',
  ];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="mb-3 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-300 bg-clip-text text-transparent">
          Free YouTube Video Summarizer
        </h1>
        <p className="text-slate-400">
          Batch summarize YouTube videos in seconds, generating comprehensive and in-depth summaries.
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 mb-6 justify-center">
        <button
          onClick={() => setActiveTab('youtube')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            activeTab === 'youtube'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <Youtube size={18} />
          YouTube
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            activeTab === 'video'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <Video size={18} />
          Video
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            activeTab === 'audio'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <Headphones size={18} />
          Audio
        </button>
      </div>

      {activeTab === 'audio' || activeTab === 'video' ? (
        <div className="mt-6">
          <AudioSummarizer mode={activeTab === 'video' ? 'video' : 'audio'} />
        </div>
      ) : (
        <>
          {/* YouTube Video Input */}
          <div className="mb-6">
            {links.map((link, index) => (
              <div key={index} className="mb-3">
                <input
                  type="text"
                  value={link}
                  onChange={(e) => updateLink(index, e.target.value)}
                  placeholder="Paste the YouTube video link, for example: https://www.youtube.com/watch?v=example"
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 text-slate-100 placeholder:text-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500/70 transition-all"
                />
              </div>
            ))}
            
            <button
              onClick={addMoreLink}
              className="flex items-center gap-2 text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              <Plus size={18} />
              Add More Link
            </button>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateSummary}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700 disabled:opacity-60 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mb-8"
            style={{ background: 'linear-gradient(90deg, #66d044 0%, #14eb65 100%)' }}
          >
            <Sparkles size={18} />
            {loading ? 'Processing…' : 'Get Transcript'}
          </button>

          {/* Example Section */}
          <div className="mb-4">
            <h3 className="mb-4 text-emerald-400">Example</h3>
            <div className="grid grid-cols-4 gap-4">
              {exampleVideos.map((video, index) => (
                <div
                  key={index}
                  className="aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-slate-800"
                  style={{
                    background: '#1a1a1a',
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-emerald-950 to-slate-900 flex items-center justify-center">
                    <Youtube size={32} className="text-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
