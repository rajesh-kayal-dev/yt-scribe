import { motion } from 'motion/react';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { ChatbotPopup } from './ChatbotPopup';

interface ChatbotFullScreenProps {
  setActiveSection: (section: any) => void;
}

export function ChatbotFullScreen({ setActiveSection }: ChatbotFullScreenProps) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Button
          variant="ghost"
          onClick={() => setActiveSection('home')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <MessageCircle className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Assistant
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Your 24/7 helper for all things YouTube
          </p>
        </div>
      </motion.div>

      {/* Full Screen Chat Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-5xl mx-auto"
      >
        <div className="bg-card border border-primary/20 rounded-2xl shadow-2xl overflow-hidden h-[calc(100vh-300px)] min-h-[600px]">
          {/* Header */}
          <div className="h-20 bg-gradient-to-r from-primary to-accent px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white text-xl">AI Assistant</h2>
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-green-400 rounded-full"
                  />
                  <p className="text-sm text-white/90">Online & Ready to Help</p>
                </div>
              </div>
            </div>

            {/* Feature Badges */}
            <div className="hidden md:flex gap-2">
              {['24/7 Support', 'AI-Powered', 'Instant Help'].map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs"
                >
                  {badge}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="h-[calc(100%-5rem)]">
            <ChatbotPopup isPopup={false} />
          </div>
        </div>
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid md:grid-cols-3 gap-6 mt-8 max-w-5xl mx-auto"
      >
        {[
          {
            title: 'Ask Anything',
            desc: 'Get help with transcriptions, tags, thumbnails and more',
          },
          {
            title: 'Smart Responses',
            desc: 'AI-powered answers tailored to your needs',
          },
          {
            title: 'Always Learning',
            desc: 'Our AI gets smarter with every conversation',
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="p-6 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20"
          >
            <h3 className="mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}