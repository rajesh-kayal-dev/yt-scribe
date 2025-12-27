import { motion } from 'motion/react';
import { Heart, Code, Zap, Mail, Github, Twitter, Play } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function AboutPage() {
  const techStack = [
    { name: 'MongoDB', icon: '🍃', description: 'Database' },
    { name: 'Express.js', icon: '⚡', description: 'Backend Framework' },
    { name: 'React', icon: '⚛️', description: 'Frontend Library' },
    { name: 'Node.js', icon: '🟢', description: 'Runtime Environment' },
    { name: 'Gemini AI', icon: '✨', description: 'AI Integration' },
    { name: 'Socket.io', icon: '🔌', description: 'Real-time Sync' },
  ];

  const team = [
    {
      name: 'Bhavesh Mahawar',
      role: 'UI/UX & Front-End Developer',
      description: 'Crafted the beautiful and intuitive user interface',
      email: 'bhaveshmahawar97@gmail.com',
      github: '#', // Placeholder
    },
    {
      name: 'Rajesh Kayal',
      role: 'Back-End & AI Developer',
      description: 'Built the powerful backend and AI integration',
      email: 'rajeshkalay8001@gmail.com',
      github: 'https://github.com/rajesh-kayal-dev',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <Badge variant="secondary" className="mb-4 text-xs text-muted-foreground">
          About YTScribe
        </Badge>
        <h1 className="text-5xl md:text-6xl mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Empowering Learners Everywhere
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          We're on a mission to make online learning more organized, productive, and enjoyable for everyone.
        </p>
      </motion.div>

      {/* Mission Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-16"
      >
        <Card className="p-12 border-primary/20 bg-gradient-to-br from-card to-primary/5 text-center">
          <Heart className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h2 className="text-3xl mb-4">Our Mission</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            YouTube has billions of educational videos, but learning from them can be chaotic. YTScribe transforms scattered videos into structured learning journeys with AI-powered notes, transcripts, and productivity tools. We believe everyone deserves access to organized, effective learning tools.
          </p>
        </Card>
      </motion.div>

      {/* Tech Stack */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-16"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <Code className="w-8 h-8 text-primary" />
          <h2 className="text-3xl">Technology Stack</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {techStack.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="p-6 border-primary/20 hover:border-primary/50 transition-all text-center">
                <div className="text-5xl mb-3">{tech.icon}</div>
                <h3 className="text-lg mb-1">{tech.name}</h3>
                <p className="text-sm text-muted-foreground">{tech.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Team Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-16"
      >
        <h2 className="text-3xl mb-2 text-center">Meet the Team</h2>
        <p className="text-center text-muted-foreground mb-8">
          MCA Graduates • Dev Bhoomi Uttarakhand University, Dehradun
        </p>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-primary/5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <Code className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl mb-1">{member.name}</h3>
                    <p className="text-sm text-primary mb-2">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-primary/10">
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.email}</span>
                  </a>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Mentor Section */}
        <Card className="p-8 border-primary/20 bg-gradient-to-br from-card to-accent/5 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl mb-1">Project Mentor</h3>
          <p className="text-lg mb-2">Mr. Sanjay Kumar Tuddu</p>
          <p className="text-sm text-muted-foreground">Assistant Professor</p>
          <p className="text-sm text-muted-foreground">Dev Bhoomi Uttarakhand University, Dehradun</p>
        </Card>
      </motion.div>

      {/* Version & Support */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-16"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 border-primary/20">
            <h3 className="text-xl mb-4">Current Version</h3>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-5xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                v1.0.0
              </span>
              <Badge variant="secondary">Beta</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Released: November 2024
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <div>✨ AI-powered note generation</div>
              <div>📊 Learning analytics dashboard</div>
              <div>⏱️ Pomodoro productivity timer</div>
              <div>🎯 Progress tracking & streaks</div>
            </div>
          </Card>

          <Card className="p-8 border-primary/20">
            <h3 className="text-xl mb-4">Copyright & License</h3>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                © 2024 YTScribe. All rights reserved.
              </p>
              <p className="text-muted-foreground">
                Developed by Bhavesh Mahawar and Rajesh Kayal
              </p>
              <p className="text-muted-foreground">
                Dev Bhoomi Uttarakhand University, Dehradun
              </p>
              <p className="text-muted-foreground">
                Under the guidance of Mr. Sanjay Kumar Tuddu (Assiestent Professor)
              </p>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-primary/10">
                This project is part of the MCA program curriculum. All intellectual property rights are governed by university policies and applicable laws.
              </p>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Tutorial Video Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-16"
      >
        <h2 className="text-3xl mb-8 text-center">Platform Walkthrough</h2>
        <Card className="overflow-hidden border-primary/20 max-w-4xl mx-auto">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative group cursor-pointer">
            <div className="text-center z-10">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <Play className="w-10 h-10 text-white ml-1" />
              </motion.div>
              <p className="text-white text-lg">Complete Feature Demo</p>
              <p className="text-sm text-white/70 mt-2">Learn how to use all features effectively</p>
            </div>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
          </div>
          <div className="p-6 bg-card">
            <h3 className="mb-2">What You'll Learn:</h3>
            <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Creating and managing playlists
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Using the custom video player
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Generating AI notes
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Tracking your progress
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Working with transcripts
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Using productivity tools
              </li>
            </ul>
          </div>
        </Card>
      </motion.div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-center"
      >
        <Card className="p-10 border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10">
          <h2 className="text-2xl mb-4">Join Our Community</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Have questions or suggestions? We'd love to hear from you!
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">
              Contact Us
            </Button>
            <Button variant="outline">
              View Documentation
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}