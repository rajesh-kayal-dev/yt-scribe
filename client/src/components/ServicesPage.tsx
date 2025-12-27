import { motion } from 'motion/react';
import {
  Play,
  FileText,
  Sparkles,
  BarChart3,
  Brain,
  Clock,
  Download,
  Zap,
  Shield,
  Users,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function ServicesPage() {
  const features = [
    {
      icon: Play,
      title: 'Custom Video Player',
      description: 'Advanced video player with focus mode, theater mode, and Pomodoro timer for productive learning.',
      benefits: ['Skip prevention', 'Playback speed control', 'Theater & focus modes', 'Ambient lighting'],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FileText,
      title: 'Smart Transcripts',
      description: 'Auto-synced, searchable transcripts that follow along with the video in real-time.',
      benefits: ['Time-stamped', 'Searchable', 'Auto-scroll', 'Copy & export'],
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Sparkles,
      title: 'AI Note Generation',
      description: 'AI-powered note generation that creates structured, student-friendly summaries from video transcripts.',
      benefits: ['Bullet points', 'Key concepts', 'Examples included', 'Auto-save'],
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Brain,
      title: 'AI Learning Tools',
      description: 'Quiz generator, flashcards, and difficulty meter to enhance your learning experience.',
      benefits: ['Auto quizzes', 'Flashcards', 'Spaced repetition', 'Progress tracking'],
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Clock,
      title: 'Productivity Tools',
      description: 'Built-in Pomodoro timer, daily goals, and streak tracking to keep you motivated.',
      benefits: ['Pomodoro timer', 'Daily goals', 'Streak counter', 'Time tracking'],
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: BarChart3,
      title: 'Learning Analytics',
      description: 'Comprehensive dashboard showing your progress, time spent, and achievement milestones.',
      benefits: ['Progress graphs', 'Weekly stats', 'Achievements', 'Streak tracking'],
      color: 'from-pink-500 to-rose-500',
    },
  ];

  const howItHelps = [
    {
      title: 'For Students',
      points: [
        'Organized learning with playlists',
        'AI-generated notes save time',
        'Track progress and stay motivated',
        'Study smarter with Pomodoro timer',
      ],
    },
    {
      title: 'For Educators',
      points: [
        'Create structured learning paths',
        'Monitor student progress',
        'Share curated playlists',
        'Export notes and materials',
      ],
    },
    {
      title: 'For Self-Learners',
      points: [
        'Personalized learning journey',
        'Build consistent study habits',
        'Achieve learning goals faster',
        'All your notes in one place',
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <Badge variant="secondary" className="mb-4 text-xs text-muted-foreground" >
          All-in-One Learning Platform
        </Badge>
        <h1 className="text-5xl md:text-6xl mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Everything You Need to Learn Better
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Transform your YouTube learning experience with AI-powered tools, smart organization, and productivity features.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">
            Get Started Free
          </Button>
          <Button size="lg" variant="outline">
            Watch Demo
          </Button>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-20"
      >
        <h2 className="text-3xl mb-8 text-center">Powerful Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Card className="p-6 border-primary/20 hover:border-primary/50 transition-all h-full">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Zap className="w-3 h-3 text-primary" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How It Helps Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-20"
      >
        <h2 className="text-3xl mb-8 text-center">How It Helps You</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {howItHelps.map((section, index) => (
            <Card key={index} className="p-6 border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <h3 className="text-xl mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Video Walkthrough */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-20"
      >
        <h2 className="text-3xl mb-8 text-center">See It In Action</h2>
        <Card className="overflow-hidden border-primary/20 max-w-4xl mx-auto">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <div className="text-center">
              <Play className="w-20 h-20 mx-auto mb-4 text-white/80" />
              <p className="text-white/90">Platform Demo Video</p>
              <p className="text-sm text-white/70 mt-2">Click to watch full walkthrough</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Platform Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-20"
      >
        <h2 className="text-3xl mb-8 text-center">Why Choose YTScribe</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-8 border-primary/20 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl mb-2">Secure & Private</h3>
            <p className="text-sm text-muted-foreground">
              Your notes and data are encrypted and stored securely
            </p>
          </Card>
          <Card className="p-8 border-primary/20 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 text-accent" />
            <h3 className="text-xl mb-2">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              Optimized performance for smooth learning experience
            </p>
          </Card>
          <Card className="p-8 border-primary/20 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl mb-2">Community Driven</h3>
            <p className="text-sm text-muted-foreground">
              Share and discover notes from other learners
            </p>
          </Card>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center"
      >
        <Card className="p-12 border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10">
          <h2 className="text-3xl mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already using YTScribe to study smarter and achieve their goals faster.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">
              Start Learning Now
            </Button>
            <Button size="lg" variant="outline">
              View User Guide
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
