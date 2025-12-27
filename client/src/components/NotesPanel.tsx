import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Folder, Tag, Download, FileDown, Save, Trash2, Edit, Sparkles, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { generatePlaylistVideoNotes } from '../api/playlist';
import ReactMarkdown from 'react-markdown';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface Note {
  id: number;
  title: string;
  content: string;
  timestamp?: number;
  folder: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface NotesPanelProps {
  videoId: string;
}

export function NotesPanel({ videoId }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      title: 'Introduction Summary',
      content: 'Key points from the introduction:\n- HTML basics\n- CSS fundamentals\n- JavaScript overview',
      timestamp: 0,
      folder: 'Web Dev',
      tags: ['basics', 'intro'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editFolder, setEditFolder] = useState('');
  const [newTag, setNewTag] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [generatingAI, setGeneratingAI] = useState(false);

  const folders = ['Web Dev', 'React', 'JavaScript', 'CSS', 'Personal'];

  const handleGenerateAINotes = async () => {
    if (!videoId) {
      toast.error('Missing video id for AI notes');
      return;
    }

    try {
      setGeneratingAI(true);
      const res = await generatePlaylistVideoNotes({ videoId });
      const content = (res?.notes || '').trim();
      if (!content) {
        toast.error('AI did not return any notes');
        return;
      }

      const aiNote: Note = {
        id: notes.length + 1,
        title: `AI Summary - Video ${videoId}`,
        content,
        folder: 'Web Dev',
        tags: ['AI-generated', 'summary'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setNotes([aiNote, ...notes]);
      setSelectedNote(aiNote);
      setIsEditing(false);
      toast.success('AI notes generated successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to generate AI notes');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: notes.length + 1,
      title: 'New Note',
      content: '',
      folder: 'Web Dev',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes([...notes, newNote]);
    setSelectedNote(newNote);
    setIsEditing(true);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    setEditFolder(newNote.folder);
    setEditTags(newNote.tags);
  };

  const handleSaveNote = () => {
    if (selectedNote) {
      const updatedNotes = notes.map((note) =>
        note.id === selectedNote.id
          ? {
              ...note,
              title: editTitle,
              content: editContent,
              folder: editFolder,
              tags: editTags,
              updatedAt: new Date(),
            }
          : note
      );
      setNotes(updatedNotes);
      setSelectedNote({
        ...selectedNote,
        title: editTitle,
        content: editContent,
        folder: editFolder,
        tags: editTags,
      });
      setIsEditing(false);
      toast.success('Note saved!');
    }
  };

  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter((note) => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
    toast.success('Note deleted');
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim())) {
      setEditTags([...editTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEditTags(editTags.filter((t) => t !== tag));
  };

  const handleExportPDF = () => {
    toast.success('Exporting to PDF...');
  };

  const handleExportDOCX = () => {
    toast.success('Exporting to DOCX...');
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'No timestamp';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 border-primary/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl">My Notes</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateAINotes}
            disabled={generatingAI}
            className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/50"
          >
            {generatingAI ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Notes
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
          >
            <FileDown className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportDOCX}
          >
            <Download className="w-4 h-4 mr-2" />
            DOCX
          </Button>
          <Button
            onClick={handleCreateNote}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Notes List */}
        <div className="col-span-1 space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {notes.map((note) => (
            <motion.div
              key={note.id}
              whileHover={{ x: 4 }}
              onClick={() => {
                setSelectedNote(note);
                setIsEditing(false);
              }}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedNote?.id === note.id
                  ? 'bg-primary/10 border-2 border-primary/50'
                  : 'bg-accent/5 hover:bg-accent/10 border-2 border-transparent'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="line-clamp-1">{note.title}</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {note.content || 'Empty note'}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Folder className="w-3 h-3" />
                <span>{note.folder}</span>
                {note.timestamp !== undefined && (
                  <>
                    <span>•</span>
                    <span>{formatTime(note.timestamp)}</span>
                  </>
                )}
              </div>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {note.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
          ))}

          {notes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No notes yet</p>
            </div>
          )}
        </div>

        {/* Note Editor */}
        <div className="col-span-2">
          {selectedNote ? (
            <div className="space-y-4">
              {isEditing ? (
                <>
                  {/* Edit Mode */}
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Note title"
                    className="text-lg"
                  />

                  <div className="flex gap-4">
                    <Select value={editFolder} onValueChange={setEditFolder}>
                      <SelectTrigger className="w-48">
                        <Folder className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {folders.map((folder) => (
                          <SelectItem key={folder} value={folder}>
                            {folder}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="text-sm">Tags</label>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      />
                      <Button variant="outline" onClick={handleAddTag}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editTags.map((tag, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Start typing your notes..."
                    className="min-h-[400px] resize-none font-mono text-sm"
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveNote}
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Note
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* View Mode */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl mb-2">{selectedNote.title}</h2>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Folder className="w-4 h-4" />
                        <span>{selectedNote.folder}</span>
                        {selectedNote.timestamp !== undefined && (
                          <>
                            <span>•</span>
                            <span>At {formatTime(selectedNote.timestamp)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(true);
                        setEditTitle(selectedNote.title);
                        setEditContent(selectedNote.content);
                        setEditFolder(selectedNote.folder);
                        setEditTags(selectedNote.tags);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>

                  {selectedNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedNote.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="bg-accent/5 rounded-lg p-6 min-h-[400px] prose prose-sm max-w-none">
                    {selectedNote.content ? (
                      <ReactMarkdown
                        components={{
                          h1: ({ node, ...props }) => <h1 className="text-xl font-semibold mb-3" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-base font-semibold mt-3 mb-1" {...props} />,
                          p: ({ node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto mb-3">
                              <table className="min-w-full text-sm" {...props} />
                            </div>
                          ),
                          code: ({ node, inline, ...props }) => (
                            <code
                              className={inline ? 'px-1 py-0.5 rounded bg-black/10 text-xs' : 'block p-2 rounded bg-black/10 text-xs whitespace-pre-wrap'}
                              {...props}
                            />
                          ),
                        }}
                      >
                        {selectedNote.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-sm text-muted-foreground">This note is empty</p>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last updated: {selectedNote.updatedAt.toLocaleDateString()}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-center">
              <Plus className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl mb-2 text-muted-foreground">No note selected</h3>
              <p className="text-muted-foreground mb-4">
                Select a note from the list or create a new one
              </p>
              <Button
                onClick={handleCreateNote}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Note
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
