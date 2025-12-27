import { motion } from 'motion/react';
import { Github, Twitter, Youtube, Heart } from 'lucide-react';

interface FooterProps {
  setActiveSection?: (section: any) => void;
}

export function Footer({ setActiveSection }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-primary/20 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="mb-4">YTScribe</h3>
            <p className="text-xs text-muted-foreground">
              Transform YouTube content with the power of AI
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li onClick={() => setActiveSection?.('transcribe')} className="hover:text-primary cursor-pointer transition-colors">Transcription</li>
              <li onClick={() => setActiveSection?.('playlist')} className="hover:text-primary cursor-pointer transition-colors">Playlists</li>
              <li onClick={() => setActiveSection?.('notes')} className="hover:text-primary cursor-pointer transition-colors">Notes</li>
              <li onClick={() => setActiveSection?.('chatbot')} className="hover:text-primary cursor-pointer transition-colors">AI Assistant</li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li onClick={() => setActiveSection?.('services')} className="hover:text-primary cursor-pointer transition-colors">Services</li>
              <li onClick={() => setActiveSection?.('about')} className="hover:text-primary cursor-pointer transition-colors">About</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Support</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Blog</li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm">Connect</h4>
            <div className="flex gap-4">
              {[
                { icon: Github, label: 'GitHub' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Youtube, label: 'YouTube' },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                >
                  <social.icon className="w-5 h-5 text-primary" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2024 YTScribe. All rights reserved.</p>
          <div className="flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-primary fill-primary" /> for creators
          </div>
        </div>
      </div>
    </footer>
  );
}
