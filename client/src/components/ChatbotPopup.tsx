import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotPopupProps {
  isPopup?: boolean;
}

export function ChatbotPopup({ isPopup = false }: ChatbotPopupProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hey there! 👋 I'm your AI assistant. I can help you with transcriptions, tags, thumbnails, and more! What can I do for you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponses = [
        "That's a great question! Let me help you with that. You can paste any YouTube URL in the Transcribe section to get AI-generated notes.",
        "I can help you generate trending tags for your videos! Just head over to the Tags section and enter your video topic.",
        "Want to create eye-catching thumbnails? Check out our Thumbnail Studio where you can download or generate AI-powered thumbnails!",
        "Looking for inspiration? Browse our Trending Notes section to see what's popular in the community right now.",
        "I'm here 24/7 to help you with anything you need. Feel free to ask me about any of our features!",
      ];

      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponses[Math.floor(Math.random() * botResponses.length)],
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "How do I transcribe a video?",
    "How do I access my purchased courses?",
    "Tell me about the AI note summarization.",
    "How can I track my learning progress?",
    "Who are the developers of YTScribe?",
];

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'bot'
                  ? 'bg-gradient-to-br from-primary to-accent'
                  : 'bg-secondary'
              }`}
            >
              {message.sender === 'bot' ? (
                <Bot className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-foreground" />
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                message.sender === 'bot'
                  ? 'bg-secondary text-foreground rounded-tl-none'
                  : 'bg-gradient-to-br from-primary to-accent text-white rounded-tr-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === 'bot' ? 'text-muted-foreground' : 'text-white/70'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-secondary rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Suggested Questions */}
        {messages.length === 1 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <p className="text-xs text-muted-foreground text-center">Quick actions:</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestedQuestions.map((question, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInputValue(question)}
                  className="text-xs p-2 rounded-lg bg-accent/10 hover:bg-accent/20 border border-accent/20 text-left transition-colors"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-primary/10 bg-card/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Powered by AI <Sparkles className="w-3 h-3 inline" />
        </p>
      </div>
    </div>
  );
}
