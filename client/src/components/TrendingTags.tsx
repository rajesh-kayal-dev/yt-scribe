import { useState } from 'react';
import { motion } from 'motion/react';
import { Hash, Copy, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

export function TrendingTags() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const handleGenerate = () => {
    if (!topic) {
      toast.error('Please enter a topic or video title');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setTags([
        'WebDevelopment',
        'Coding',
        'Programming',
        'React',
        'JavaScript',
        'Tutorial',
        'LearnToCode',
        'TechTutorial',
        'FrontendDev',
        'WebDesign',
        '2024',
        'CodeWithMe',
        'DeveloperLife',
        'TechTips',
        'SoftwareEngineering',
        'CodeNewbie',
        'BuildInPublic',
        'DevCommunity',
        'OpenSource',
        'FullStack',
      ]);
      setLoading(false);
      toast.success('Tags generated!');
    }, 1500);
  };

  const handleCopyAll = () => {
    const tagString = tags.map(tag => `#${tag}`).join(' ');
    navigator.clipboard.writeText(tagString);
    toast.success('All tags copied!');
  };

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(`#${tag}`);
    toast.success('Tag copied!');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 mb-4">
          <Hash className="w-8 h-8 text-primary" />
          <h1 className="text-4xl md:text-5xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Trending Tags
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Generate viral tags for maximum reach and engagement
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
            <Input
              placeholder="Enter your video topic or title..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1 h-12"
            />
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white h-12 px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Tags
                </>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Tags Display */}
      {tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 border-primary/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl">Your Tags</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleGenerate}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button size="sm" onClick={handleCopyAll} className="bg-gradient-to-r from-primary to-accent text-white">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {tags.map((tag, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge
                    variant="secondary"
                    className="px-4 py-2 text-sm cursor-pointer bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border border-primary/20 group"
                    onClick={() => handleCopyTag(tag)}
                  >
                    <Hash className="w-3 h-3 mr-1" />
                    {tag}
                    <Copy className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Badge>
                </motion.div>
              ))}
            </div>

            {/* Tag Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-primary/10">
              <div className="text-center">
                <div className="text-2xl mb-1">{tags.length}</div>
                <div className="text-sm text-muted-foreground">Total Tags</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">95%</div>
                <div className="text-sm text-muted-foreground">Relevance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">High</div>
                <div className="text-sm text-muted-foreground">Viral Potential</div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Tips Section */}
      {!tags.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-6 mt-12"
        >
          {[
            { title: 'AI-Powered', desc: 'Smart tag suggestions based on trends' },
            { title: 'Optimized', desc: 'Tags designed for maximum reach' },
            { title: 'One-Click Copy', desc: 'Copy tags instantly' },
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
