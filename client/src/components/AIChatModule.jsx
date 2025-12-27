import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export default function AIChatModule() {
  const [messages, setMessages] = useState([{
    role: 'ai',
    text: "Hi! I'm YTSbot. I can help you explore YTScribe, explain features, or navigate to sections."
  }]); // {role: 'user'|'ai', text}
  const [input, setInput] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [showChips, setShowChips] = useState(true);
  const socketRef = useRef(null);
  const listRef = useRef(null);

  // Corrected Suggested Questions (Mapped to functional features)
  const suggestedQuestions = [
    "How do I transcribe a video?",
    "How do I access my purchased courses?",
    "Tell me about the AI note summarization.",
    "How can I track my learning progress?",
    "Who are the developers of YTScribe?",
  ];

  useEffect(() => {
    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('receiveChunk', ({ text }) => {
      setCurrentResponse((prev) => prev + (text || ''));
    });

    socket.on('streamEnd', () => {
      if (currentResponse.trim()) {
        setMessages((prev) => [...prev, { role: 'ai', text: currentResponse }]);
      }
      setCurrentResponse('');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, currentResponse]);

  const sendMessage = (e) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || !socketRef.current) return;

    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setInput('');
    socketRef.current.emit('sendMessage', { message: msg });
    if (showChips) setShowChips(false);
  };

  const sendQuick = (msg) => {
    if (!socketRef.current) return;
    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    socketRef.current.emit('sendMessage', { message: msg });
    setShowChips(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-card/60 border border-primary/20 rounded-xl overflow-hidden flex flex-col h-[70vh]">
      <div className="px-4 py-3 border-b border-primary/20 bg-background/60 sticky top-0 z-10">
        <h2 className="text-lg">AI Assistant</h2>
        <p className="text-xs text-muted-foreground">Streaming responses powered by Gemini</p>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'ai' && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-cyan-500/20 text-cyan-300 text-[10px]">YTS</div>
            )}
            <div className={`max-w-[80%] px-3 py-2 rounded-lg border ${m.role === 'user' ? 'bg-primary/20 border-primary/30' : 'bg-accent/10 border-accent/20'}`}>
              <div className="text-[10px] mb-1 opacity-70">{m.role === 'user' ? 'You' : 'YTSbot'}</div>
              <span className="text-sm whitespace-pre-wrap">{m.text}</span>
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-primary/20 text-primary text-[10px]">You</div>
            )}
          </div>
        ))}
        {currentResponse && (
          <div className="flex items-start gap-2 justify-start">
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-cyan-500/20 text-cyan-300 text-[10px]">YTS</div>
            <div className="max-w-[80%] px-3 py-2 rounded-lg border bg-accent/10 border-accent/20">
              <div className="text-[10px] mb-1 opacity-70">YTSbot</div>
              <span className="text-sm whitespace-pre-wrap">{currentResponse}<span className="animate-pulse">▍</span></span>
            </div>
          </div>
        )}
      </div>

      {showChips && (
        <div className="px-3 pb-2 flex flex-wrap gap-2 border-t border-primary/10 bg-background/50">
          {suggestedQuestions.map((chip, i) => (
            <button key={i} onClick={() => sendQuick(chip)} className="text-xs px-3 py-1.5 rounded-full bg-card border border-primary/20 hover:border-primary/40 transition">
              {chip}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={sendMessage} className="p-3 border-t border-primary/20 bg-background/60 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the AI assistant..."
          className="flex-1 px-3 py-2 rounded-lg bg-card border border-primary/20 outline-none focus:border-primary/50"
        />
        <button type="submit" className="px-4 py-2 rounded-lg text-white bg-[linear-gradient(90deg,#A78BFA_0%,#06B6D4_100%)] hover:opacity-90">
          Send
        </button>
      </form>
    </div>
  );
}
