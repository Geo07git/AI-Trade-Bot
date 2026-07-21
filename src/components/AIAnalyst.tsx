import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: 'ai' | 'user';
  content: string;
}

export function AIAnalyst() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'System online. I am connected to the current market data stream. What asset or strategy would you like to analyze?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      // Mock market context for the prompt
      const context = "Current SPY: 512.20. NVDA showing strong momentum above 115. TSLA facing resistance at 250.";
      
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg, context })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'ai', content: data.result }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: `[ERROR]: ${data.error}` }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'ai', content: `[SYSTEM FAILURE]: Could not reach analysis engine.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505]">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-900/10 backdrop-blur-md shrink-0">
        <div>
          <h1 className="font-serif text-xl text-white">AI Analysis Engine</h1>
          <p className="text-[10px] uppercase text-zinc-500 tracking-wider mt-0.5">Real-time market insights</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={cn(
              "flex gap-4",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                msg.role === 'ai' ? "bg-zinc-800/80 text-emerald-400 border-white/10" : "bg-white/5 text-zinc-300 border-transparent"
              )}>
                {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
              </div>
              
              <div className={cn(
                "px-5 py-4 rounded-2xl text-zinc-200 leading-relaxed font-sans text-sm",
                msg.role === 'user' ? "bg-white/10" : "bg-zinc-900/50 border border-white/5 shadow-sm"
              )}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-zinc-800/80 text-emerald-400 border border-white/10 flex items-center justify-center shrink-0">
                <Loader2 size={16} className="animate-spin" />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-zinc-900/50 border border-white/5 shadow-sm text-zinc-400 font-sans text-sm flex items-center gap-2">
                <span className="animate-pulse">Processing data...</span>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
      </div>

      <div className="p-6 border-t border-white/5 shrink-0 bg-zinc-900/10 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Query real-time data or strategy parameters..."
            className="w-full bg-zinc-900/50 border border-white/10 rounded-full pl-6 pr-14 py-4 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-white/20 transition-all font-sans text-sm"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:hover:bg-white/10 transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
