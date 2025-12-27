import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { ChatbotPopup } from './ChatbotPopup';

interface ChatbotButtonProps {
  setActiveSection: (section: any) => void;
}

export function ChatbotButton({ setActiveSection }: ChatbotButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(true);

  const handleOpenFullScreen = () => {
    setIsOpen(false);
    setActiveSection('chatbot');
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50 chatbot-fab"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                size="icon"
                onClick={() => {
                  setIsOpen(true);
                  setHasNewMessage(false);
                }}
                className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/50"
              >
                <MessageCircle className="w-7 h-7 text-white" />
                
                {/* Notification Badge */}
                {hasNewMessage && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-white text-xs"
                  >
                    1
                  </motion.span>
                )}

                {/* Pulse Animation */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary"
                  animate={{
                    scale: [1, 1.5, 1.5],
                    opacity: [0.5, 0, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Popup Chatbot */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[600px] max-h-[80vh]"
          >
            <div className="relative h-full bg-card rounded-2xl shadow-2xl border border-primary/20 overflow-hidden">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-primary to-accent px-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white">AI Assistant</h3>
                    <p className="text-xs text-white/80">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleOpenFullScreen}
                    className="w-8 h-8 hover:bg-white/20 text-white"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 hover:bg-white/20 text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Chat Content */}
              <div className="h-full pt-16">
                <ChatbotPopup isPopup={true} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}