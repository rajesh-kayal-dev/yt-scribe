import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Play, Edit, Trash2, X, AlertTriangle, BookOpen } from 'lucide-react';
import { updatePlaylist, deletePlaylist } from '../api/playlist';
import { toast } from 'sonner';

export default function PlaylistCard({ playlist, onView, onRefresh }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openEdit = () => {
    setEditTitle(playlist.title || '');
    setIsEditOpen(true);
  };

  const onSaveEdit = async () => {
    try {
      if (!editTitle || editTitle.trim() === '' || editTitle === playlist.title) {
        setIsEditOpen(false);
        return;
      }
      setSaving(true);
      await updatePlaylist(playlist._id, { title: editTitle.trim() });
      toast.success('Playlist updated');
      setIsEditOpen(false);
      onRefresh && onRefresh();
    } catch (e) {
      toast.error(e?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const onConfirmDelete = async () => {
    try {
      setDeleting(true);
      await deletePlaylist(playlist._id);
      toast.success('Playlist deleted');
      setIsDeleteOpen(false);
      onRefresh && onRefresh();
    } catch (e) {
      toast.error(e?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="h-full border-slate-800 hover:border-primary/50 transition-all bg-gradient-to-br from-card to-primary/5 overflow-hidden group cursor-pointer">
      {/* Header image / cover */}
      <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden" onClick={onView}>
        {playlist.thumbnailUrl ? (
          <img
            src={playlist.thumbnailUrl}
            alt={playlist.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white">
            {playlist.videosCount} videos
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6" onClick={onView}>
        <h3 className="text-xl mb-2 group-hover:text-primary transition-colors">{playlist.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {playlist.description || 'No description provided'}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Play className="w-3 h-3" />
            <span>{playlist.videosCount} videos</span>
          </div>
          <span>{playlist.progress || 0}% complete</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-primary/10">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onView && onView();
            }}
          >
            <Play className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              openEdit();
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-slate-200">Rename Playlist</h3>
              <button
                className="p-2 rounded-md hover:bg-slate-800 text-slate-400"
                onClick={() => setIsEditOpen(false)}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter new title"
            />

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="border-slate-700 text-slate-300"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={onSaveEdit}
                className="bg-blue-600 hover:bg-blue-500 text-white"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg text-slate-200">Delete Playlist?</h3>
              <button
                className="p-2 rounded-md hover:bg-slate-800 text-slate-400"
                onClick={() => setIsDeleteOpen(false)}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-start gap-3 text-red-400">
              <AlertTriangle className="w-5 h-5 mt-0.5" />
              <p>Are you sure you want to delete this? This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                className="border-slate-700 text-slate-300"
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirmDelete}
                className="bg-red-600 hover:bg-red-500 text-white"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
