import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Folder, Tag, Pin, Archive, Trash2, Search, TrendingUp, FileText, Download } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { getNotes, exportNotes } from '../api/note';
import ReactMarkdown from 'react-markdown';

interface Note {
  id: number;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  isPinned: boolean;
  isAIGenerated: boolean;
  videoId?: string;
  timestamp?: number;
  createdAt: Date;
  popularity?: number;
}

export function NotesCenter() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      title: 'HTML Fundamentals - AI Summary',
      content: '# HTML Basics\n\n## Key Concepts\n- HTML structure\n- Tags and elements\n- Semantic HTML\n\n## Important Points\n- Always use proper DOCTYPE\n- Semantic tags improve SEO',
      folder: 'Web Dev',
      tags: ['HTML', 'basics', 'fundamentals'],
      isPinned: true,
      isAIGenerated: true,
      videoId: '1',
      createdAt: new Date(),
      popularity: 234,
    },
    {
      id: 2,
      title: 'CSS Flexbox Notes',
      content: 'My personal notes on CSS Flexbox:\n\n- display: flex makes container flexible\n- justify-content aligns horizontally\n- align-items aligns vertically',
      folder: 'Web Dev',
      tags: ['CSS', 'layout'],
      isPinned: false,
      isAIGenerated: false,
      createdAt: new Date(),
    },
    {
      id: 3,
      title: 'JavaScript ES6 Features - AI Generated',
      content: '# ES6 Modern JavaScript\n\n## Arrow Functions\n- Shorter syntax\n- Lexical this binding\n\n## Template Literals\n- String interpolation\n- Multi-line strings',
      folder: 'JavaScript',
      tags: ['JavaScript', 'ES6'],
      isPinned: true,
      isAIGenerated: true,
      videoId: '3',
      createdAt: new Date(),
      popularity: 189,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const folders = ['Web Dev', 'JavaScript', 'React', 'CSS', 'Personal'];

  useEffect(() => {
    (async () => {
      try {
        const res = await getNotes();
        const serverNotes = (res?.notes || []).map((n: any, idx: number) => ({
          id: notes.length + idx + 1,
          title: n.title || 'Untitled note',
          content: n.content || '',
          folder: 'AI Notes',
          tags: Array.isArray(n.tags) ? n.tags : [],
          isPinned: false,
          isAIGenerated: !!n.isAIGenerated,
          videoId: n.videoId,
          createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
          popularity: 0,
        }));
        if (serverNotes.length) {
          setNotes((prev) => [...serverNotes, ...prev]);
        }
      } catch (err: any) {
        console.error('Failed to load notes', err);
      }
    })();
  }, []);

  const handleTogglePin = (id: number) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    ));
    toast.success('Note updated');
  };

  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
    toast.success('Note deleted');
  };

  const handleExportAll = async () => {
    try {
      toast.loading('Preparing your notes for export...');
      await exportNotes();
      toast.dismiss();
      toast.success('Notes exported successfully!');
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.dismiss();
      toast.error(error?.message || 'Failed to export notes');
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === 'all' || note.folder === selectedFolder;
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'ai' && note.isAIGenerated) ||
                       (activeTab === 'manual' && !note.isAIGenerated) ||
                       (activeTab === 'pinned' && note.isPinned);
    
    return matchesSearch && matchesFolder && matchesTab;
  });

  const trendingNotes = notes
    .filter(n => n.popularity)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Notes Center
            </h1>
            <i  className="text-muted-foreground text-sm">
              Organize and manage all your learning notes in one place
            </i>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportAll}>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 border-primary/20">
            <div className="text-2xl mb-1">{notes.length}</div>
            <div className="text-sm text-muted-foreground">Total Notes</div>
          </Card>
          <Card className="p-4 border-primary/20">
            <div className="text-2xl mb-1">{notes.filter(n => n.isAIGenerated).length}</div>
            <div className="text-sm text-muted-foreground">AI Generated</div>
          </Card>
          <Card className="p-4 border-primary/20">
            <div className="text-2xl mb-1">{notes.filter(n => n.isPinned).length}</div>
            <div className="text-sm text-muted-foreground">Pinned</div>
          </Card>
          <Card className="p-4 border-primary/20">
            <div className="text-2xl mb-1">{folders.length}</div>
            <div className="text-sm text-muted-foreground">Folders</div>
          </Card>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedFolder === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedFolder('all')}
          >
            All Folders
          </Button>
          {folders.map(folder => (
            <Button
              key={folder}
              variant={selectedFolder === folder ? 'default' : 'outline'}
              onClick={() => setSelectedFolder(folder)}
            >
              <Folder className="w-4 h-4 mr-2" />
              {folder}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="ai">AI Generated ({notes.filter(n => n.isAIGenerated).length})</TabsTrigger>
          <TabsTrigger value="manual">Manual ({notes.filter(n => !n.isAIGenerated).length})</TabsTrigger>
          <TabsTrigger value="pinned">Pinned ({notes.filter(n => n.isPinned).length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Notes Grid */}
        <div className="lg:col-span-3">
          <div className="grid md:grid-cols-2 gap-4">
            {filteredNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 border-primary/20 hover:border-primary/50 transition-all h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {note.isPinned && <Pin className="w-4 h-4 text-primary" />}
                      {note.isAIGenerated && (
                        <Badge variant="secondary" className="bg-accent/20">
                          AI
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleTogglePin(note.id)}
                      >
                        <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-primary text-primary' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg mb-2 line-clamp-2">{note.title}</h3>
                  <div className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1 overflow-hidden">
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => <p className="inline" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-4 inline" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-4 inline" {...props} />,
                        li: ({ node, ...props }) => <li className="inline" {...props} />,
                        h1: ({ node, ...props }) => <strong {...props} />,
                        h2: ({ node, ...props }) => <strong {...props} />,
                        h3: ({ node, ...props }) => <strong {...props} />,
                        code: ({ node, inline, ...props }) => (
                          <code className="bg-black/5 px-1 rounded" {...props} />
                        ),
                      }}
                    >
                      {note.content}
                    </ReactMarkdown>
                  </div>

                  {/* Meta */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Folder className="w-3 h-3" />
                      <span>{note.folder}</span>
                      <span>•</span>
                      <span>{note.createdAt.toLocaleDateString()}</span>
                    </div>

                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredNotes.length === 0 && (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl mb-2 text-muted-foreground">No notes found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or create a new note
              </p>
            </div>
          )}
        </div>

        {/* Sidebar: Trending Notes */}
        <div className="lg:col-span-1">
          <Card className="p-6 border-primary/20 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg">Trending Notes</h3>
            </div>
            <div className="space-y-3">
              {trendingNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div className="text-lg">{index + 1}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm line-clamp-2">{note.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        <span>{note.popularity} views</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
