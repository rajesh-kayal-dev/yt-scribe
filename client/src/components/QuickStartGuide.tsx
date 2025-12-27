import { motion } from 'motion/react';
import { Shield, Play, ShoppingCart, CheckCircle, XCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface QuickStartGuideProps {
  onClose: () => void;
}

export function QuickStartGuide({ onClose }: QuickStartGuideProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-2xl w-full"
      >
        <Card className="p-8 border-primary/20 relative overflow-hidden">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4"
          >
            <XCircle className="w-5 h-5" />
          </Button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              🎉 Welcome to YTScribe!
            </h2>
            <p className="text-muted-foreground">
              Here's a quick guide to help you navigate the platform
            </p>
          </div>

          {/* Quick Access Guide */}
          <div className="space-y-4">
            {/* Admin Panel */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg mb-1">Access Admin Panel</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Click on your <strong>Profile Icon</strong> (top right) → Select <strong>"Admin Panel"</strong>
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Manage users, courses, payments & settings
                  </Badge>
                </div>
              </div>
            </div>

            {/* Demo Video */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg mb-1">Test Video Player</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Go to <strong>Playlist</strong> → Open <strong>"Demo Testing Playlist"</strong> → Click on the video
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Custom player with fullscreen, theater mode & focus mode
                  </Badge>
                </div>
              </div>
            </div>

            {/* Marketplace */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg mb-1">Course Marketplace</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Navigate to <strong>Marketplace</strong> in the top menu to browse and purchase courses
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Filter, search & buy courses with Stripe
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="mt-6 p-4 rounded-lg bg-muted/30">
            <h4 className="text-sm mb-3">✨ Key Features Available:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Admin Panel</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Video Player</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Marketplace</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Learning Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Course Creator</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Premium System</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Notes & AI</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>5 Theme System</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={onClose}
            className="w-full mt-6 bg-gradient-to-r from-primary to-accent text-white"
          >
            Got it! Let's explore 🚀
          </Button>
        </Card>
      </motion.div>
    </motion.div>
  );
}
