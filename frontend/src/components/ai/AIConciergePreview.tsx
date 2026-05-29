'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '@/shared/helpers/utils';

interface ChatMessageItem {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

const DISCOVERY_GREETING = "Hi! I'm PlaySphere AI (Discovery Mode) 🏆 I can help you find and compare sports venues in Lucknow. Ask me something like:\n\n• \"Beginner badminton near Gomti Nagar under ₹300\"\n• \"Football turf for 10 friends this weekend\"\n• \"Cheapest swimming pool near Hazratganj\"";

const GUIDANCE_GREETING = "Hi! I'm PlaySphere AI (Guidance Mode) 🏸 I'm here to provide light sports tips, basic rules, workout timing advice, and beginner suggestions. Ask me something like:\n\n• \"What are the basic rules of badminton?\"\n• \"Affordable slot timings for beginner practice\"\n• \"Simple guidelines to choose a football size\"";

export function AIConciergePreview() {
  const [mode, setMode] = useState<'discovery' | 'guidance'>('discovery');
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      role: 'assistant',
      content: DISCOVERY_GREETING,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // When mode changes, reset chat with the appropriate greeting
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: mode === 'discovery' ? DISCOVERY_GREETING : GUIDANCE_GREETING,
        timestamp: new Date(),
      },
    ]);
  }, [mode]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    // If it's a retry of the last message, don't duplicate user message in list if already there
    const isRetry = !!text && messages[messages.length - 1]?.isError;
    
    const userMessage: ChatMessageItem = {
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    if (isRetry) {
      // Remove the last error assistant message
      setMessages((prev) => prev.slice(0, -1));
    } else if (!text || !messages.some(m => m.role === 'user' && m.content === messageText && Date.now() - m.timestamp.getTime() < 5000)) {
      setMessages((prev) => [...prev, userMessage]);
    }
    
    setInput('');
    setLoading(true);

    try {
      // Get conversation history excluding initial greeting
      const history = messages
        .filter((_, idx) => idx > 0)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, history, mode }),
      });

      if (!res.ok) {
        throw new Error('API failed');
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const aiMessage: ChatMessageItem = {
        role: 'assistant',
        content: data.response || 'Something went wrong. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Concierge request error:', err);
      const errorMsg = 'AI Concierge temporarily unavailable.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMsg, timestamp: new Date(), isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    // Find the last user message to retry
    const userMsgs = messages.filter(m => m.role === 'user');
    if (userMsgs.length > 0) {
      const lastUserMsg = userMsgs[userMsgs.length - 1];
      sendMessage(lastUserMsg.content);
    }
  };

  const QUICK_PROMPTS = mode === 'discovery' 
    ? [
        'Beginner badminton near Gomti Nagar',
        'Football turf under ₹1000',
        'Cheapest swimming pool Hazratganj',
      ]
    : [
        'Beginner badminton tips',
        'Affordable time slots advice',
        'Basic football guidelines',
      ];

  return (
    <div className="bg-[#080a10] border-3 border-black rounded-lg overflow-hidden shadow-[6px_6px_0px_#000]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b-2 border-black bg-purple-600 text-white">
        <div className="w-9 h-9 rounded-md bg-yellow-400 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
          <Bot className="w-5 h-5 text-black" />
        </div>
        <div>
          <div className="font-display font-black text-white uppercase tracking-wider text-sm [text-shadow:1.5px_1.5px_0px_#000]">PlaySphere AI Concierge</div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 border border-black animate-pulse" />
            <span className="text-xs text-white/95 font-semibold">Online • Powered by Llama 3.1</span>
          </div>
        </div>
        <Sparkles className="w-4 h-4 text-yellow-400 ml-auto fill-yellow-400" />
      </div>

      {/* Mode Selector Toggle */}
      <div className="flex border-b-2 border-black p-2 bg-[#0d111d] gap-2">
        <button
          onClick={() => setMode('discovery')}
          className={cn(
            "flex-1 text-center py-1.5 text-xs font-black rounded border-2 border-black transition-all shadow-[2px_2px_0px_#000] cursor-pointer",
            mode === 'discovery' ? "bg-purple-600 text-white shadow-[1px_1px_0px_#000] translate-x-0.5 translate-y-0.5" : "bg-slate-900 text-slate-400 hover:text-white"
          )}
        >
          🔍 Discovery Mode
        </button>
        <button
          onClick={() => setMode('guidance')}
          className={cn(
            "flex-1 text-center py-1.5 text-xs font-black rounded border-2 border-black transition-all shadow-[2px_2px_0px_#000] cursor-pointer",
            mode === 'guidance' ? "bg-emerald-400 text-black shadow-[1px_1px_0px_#000] translate-x-0.5 translate-y-0.5" : "bg-slate-900 text-slate-400 hover:text-white"
          )}
        >
          🏸 Guidance Mode
        </button>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="h-80 overflow-y-auto p-4 space-y-4 scrollbar-hide scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={cn(
                "max-w-[85%] px-4 py-3 text-sm leading-relaxed",
                msg.role === 'user'
                  ? 'bg-cyan-400 text-black rounded-br-none border-2 border-black rounded-md shadow-[2px_2px_0px_#000]'
                  : msg.isError
                  ? 'bg-rose-950/40 text-rose-300 border-rose-500 shadow-[2px_2px_0px_rgba(239,68,68,0.2)] border-2 rounded-md rounded-bl-none'
                  : 'glass text-slate-200 rounded-bl-none'
              )}
            >
              <pre className="font-sans whitespace-pre-wrap">{msg.content}</pre>
              {msg.isError && (
                <button
                  onClick={handleRetry}
                  disabled={loading}
                  className="mt-2 flex items-center gap-1.5 text-xs font-bold bg-rose-500 text-black border border-black px-2 py-1 rounded shadow-[1px_1px_0px_#000] hover:bg-rose-400 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
                  Retry
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#121620] border-2 border-black rounded-md rounded-bl-none px-4 py-3 shadow-[2px_2px_0px_#000] flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce animation-delay-150ms" />
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce animation-delay-300ms" />
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="px-4 pb-3 flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => sendMessage(prompt)}
            disabled={loading}
            className="text-xs bg-[#121526] border-2 border-black rounded-md px-3 py-1.5 text-slate-300 font-bold hover:bg-cyan-400 hover:text-black hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_#000] transition-all cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 p-4 border-t-2 border-black">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          disabled={loading}
          placeholder={mode === 'discovery' ? "Ask about venues, prices, comparison..." : "Ask for basic sport tips, timing advice..."}
          className="flex-1 min-w-0"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="w-11 h-11 rounded-md bg-purple-600 text-white font-bold border-2 border-black flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-[2px_2px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all flex-shrink-0 cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white fill-white" />}
        </button>
      </div>
    </div>
  );
}
