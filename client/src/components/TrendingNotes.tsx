import { motion } from 'motion/react';
import { TrendingUp, Eye, Clock, Star } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const mockNotes = [
  {
    id: 1,
    title: 'Building a SaaS App in 2024',
    views: '12.5K',
    category: 'Development',
    time: '2 hours ago',
    rating: 4.8,
    tags: ['React', 'TypeScript', 'AI'],
  },
  {
    id: 2,
    title: 'AI Trends You Can\'t Miss',
    views: '8.3K',
    category: 'Technology',
    time: '5 hours ago',
    rating: 4.9,
    tags: ['AI', 'Machine Learning', 'Future'],
  },
  {
    id: 3,
    title: 'Content Creation Masterclass',
    views: '15.2K',
    category: 'Marketing',
    time: '1 day ago',
    rating: 4.7,
    tags: ['YouTube', 'Content', 'Growth'],
  },
  {
    id: 4,
    title: 'Design Systems from Scratch',
    views: '6.8K',
    category: 'Design',
    time: '3 hours ago',
    rating: 4.6,
    tags: ['UI/UX', 'Figma', 'Design'],
  },
  {
    id: 5,
    title: 'Productivity Hacks for Developers',
    views: '9.1K',
    category: 'Productivity',
    time: '6 hours ago',
    rating: 4.8,
    tags: ['Tips', 'Coding', 'Workflow'],
  },
  {
    id: 6,
    title: 'Next.js 15 Deep Dive',
    views: '11.4K',
    category: 'Development',
    time: '4 hours ago',
    rating: 4.9,
    tags: ['Next.js', 'React', 'Web'],
  },
];

export function TrendingNotes() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 mb-4">
          <TrendingUp className="w-8 h-8 text-primary" />
          <h1 className="text-4xl md:text-5xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Trending Notes
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Discover the most popular transcriptions from the community
        </p>
      </motion.div>

      {/* Filter Badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 justify-center mb-8"
      >
        {['All', 'Development', 'Technology', 'Marketing', 'Design'].map((filter, i) => (
          <Badge
            key={i}
            variant={i === 0 ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2"
          >
            {filter}
          </Badge>
        ))}
      </motion.div>

      {/* Notes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockNotes.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <Card className="p-6 h-full border-primary/20 hover:border-primary/50 transition-all bg-gradient-to-br from-card to-primary/5 cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <Badge variant="secondary" className="bg-accent/20">
                  {note.category}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span>{note.rating}</span>
                </div>
              </div>

              <h3 className="text-xl mb-4 group-hover:text-primary transition-colors">
                {note.title}
              </h3>

              <div className="flex flex-wrap gap-2 mb-4">
                {note.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-4 border-t border-primary/10">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{note.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{note.time}</span>
                </div>
              </div>

              <Button className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">
                View Notes
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-12"
      >
        <Button variant="outline" size="lg" className="px-8">
          Load More
        </Button>
      </motion.div>
    </div>
  );
}
