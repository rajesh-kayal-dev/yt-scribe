import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, Sparkles, Download } from 'lucide-react';
import { generatePlaylistVideoNotes } from '../api/playlist';
import { exportNotesAsPdf } from '../utils/exportUtils';
import { fetchNotes } from '../api/notes';

export default function NotesPanel({ currentVideoUrl, currentVideoId }) {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const [error, setError] = useState('');

  // Fetch saved notes when component mounts
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const data = await fetchNotes();
        setSavedNotes(data.notes || []);
      } catch (err) {
        setError('Failed to load saved notes');
      }
    };
    
    loadNotes();
  }, []);

  const onGenerate = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = currentVideoId ? { videoId: currentVideoId } : { url: currentVideoUrl };
      const res = await generatePlaylistVideoNotes(payload);
      setNotes(res.notes || '');
    } catch (e) {
      setError(e?.message || 'Failed to generate notes');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportNotesAsPdf(savedNotes, 'my-ytscribe-notes');
    } catch (err) {
      setError('Failed to export notes. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-sm disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin"/> Generating AI Notes...</>
          ) : (
            <><Sparkles className="w-4 h-4"/> Generate AI Notes</>
          )}
        </button>
        
        {savedNotes.length > 0 && (
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-500 text-white text-sm disabled:opacity-50"
          >
            {exporting ? (
              <><Loader2 className="w-4 h-4 animate-spin"/> Exporting...</>
            ) : (
              <><Download className="w-4 h-4"/> Export All as PDF</>
            )}
          </button>
        )}
      </div>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      {notes && (
        <div className="prose prose-invert max-w-none border border-purple-500/20 bg-purple-900/10 rounded-lg p-4">
          <ReactMarkdown>{notes}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
