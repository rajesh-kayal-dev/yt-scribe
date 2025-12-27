import { useState } from 'react';
import { motion } from 'motion/react';
import { Star, ThumbsUp, Share2, ExternalLink } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';

interface Video {
  id: string;
  title: string;
  url: string;
  channel: string;
  duration: string;
}

interface VideoDetailsProps {
  video: Video;
}

const emojiReactions = ['👍', '❤️', '🔥', '💡', '🎯', '⭐'];

export function VideoDetails({ video }: VideoDetailsProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const handleSubmitFeedback = () => {
    if (feedback.trim()) {
      toast.success('Feedback submitted!');
      setFeedback('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Info Card */}
      <Card className="p-6 border-primary/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl mb-2">{video.title}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{video.channel}</span>
              <span>•</span>
              <span>{video.duration}</span>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                Watch on YouTube
              </a>
            </div>
          </div>
          <Button variant="outline" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        <Separator className="my-4" />

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This is a comprehensive video tutorial that covers essential concepts and practical
            applications. You'll learn step-by-step techniques and best practices used by
            professionals in the field. Perfect for beginners and intermediate learners looking to
            expand their knowledge.
          </p>
        </div>

        <Separator className="my-4" />

        {/* Tags */}
        <div className="space-y-2">
          <h3 className="text-sm">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {['Tutorial', 'Beginner', 'Web Development', 'JavaScript', 'React'].map((tag, i) => (
              <Badge key={i} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Rating & Feedback Card */}
      <Card className="p-6 border-primary/20">
        <h3 className="text-lg mb-4">Rate This Video</h3>
        
        {/* Star Rating */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setRating(star)}
            >
              <Star
                className={`w-8 h-8 ${
                  star <= rating
                    ? 'fill-accent text-accent'
                    : 'text-muted-foreground'
                }`}
              />
            </motion.button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {rating} out of 5 stars
            </span>
          )}
        </div>

        {/* Emoji Reactions */}
        <div className="mb-6">
          <h4 className="text-sm mb-3">Quick Reaction</h4>
          <div className="flex gap-2">
            {emojiReactions.map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedEmoji(emoji)}
                className={`text-2xl w-12 h-12 rounded-full border-2 transition-all ${
                  selectedEmoji === emoji
                    ? 'border-primary bg-primary/10 scale-110'
                    : 'border-accent/20 hover:border-accent/50'
                }`}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Text Feedback */}
        <div className="space-y-3">
          <h4 className="text-sm">Leave Feedback</h4>
          <Textarea
            placeholder="Share your thoughts about this video..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitFeedback}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Card */}
      <Card className="p-6 border-primary/20">
        <h3 className="text-lg mb-4">Video Statistics</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl mb-1">4.8</div>
            <div className="text-xs text-muted-foreground">Average Rating</div>
          </div>
          <div>
            <div className="text-2xl mb-1">1.2K</div>
            <div className="text-xs text-muted-foreground">Completions</div>
          </div>
          <div>
            <div className="text-2xl mb-1">95%</div>
            <div className="text-xs text-muted-foreground">Helpful</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
