import { motion } from 'motion/react';
import { Sparkles, Zap, ShoppingBag, Crown, BookOpen, Info } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { QuickStartGuide } from './QuickStartGuide';

interface HeroProps {
  setActiveSection: (section: any) => void;
}

export function Hero({ setActiveSection }: HeroProps) {
  const [showGuide, setShowGuide] = useState(false);

  const features = [
    {
      icon: Sparkles,
      title: 'AI Transcription',
      description: 'Convert any YouTube video into clean, readable notes',
      action: () => setActiveSection('transcribe'),
    },
    {
      icon: BookOpen,
      title: 'Learning Journey',
      description: 'Organize videos into playlists for structured learning',
      action: () => setActiveSection('playlist'),
    },
    {
      icon: ShoppingBag,
      title: 'Course Marketplace',
      description: 'Discover and purchase top-rated courses from expert creators.',
      action: () => setActiveSection('marketplace'),
    },
    {
      icon: Crown,
      title: 'Go Premium',
      description: 'Unlock unlimited AI transcriptions, advanced analytics, and exclusive content.',
      action: () => setActiveSection('premium'),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-20">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-4xl mx-auto mb-20"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block mb-6"
        >
          <Zap className="w-16 h-16 text-primary mx-auto" />
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
          YouTube, Supercharged
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Transform YouTube videos into notes, generate trending tags, and create stunning thumbnails.
          All powered by AI. All in one place.
        </p>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="lg"
            onClick={() => setActiveSection('transcribe')}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-8 py-6 text-lg group"
          >
            Get Started
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="ml-2"
            >
              →
            </motion.span>
          </Button>
        </motion.div>

        
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={feature.action}
            className="relative group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-card border border-primary/20 rounded-2xl p-8 hover:border-primary/50 transition-all">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-4"
              >
                <feature.icon className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="text-xl mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 left-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-40 right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl"
      />

      
    </div>
  );
}