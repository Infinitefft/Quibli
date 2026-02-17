import React, { useState } from 'react';
import { Send, Sparkles, User, Bot, ArrowUp } from 'lucide-react';
import { useChatBot, useAutoScroll } from '@/hooks/useChatBot';

// Compact styles for mobile greetings
const GREETINGS = [
  { text: "一起探索，一起发现", style: "col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700" },
  { text: "捕捉灵感瞬间", style: "col-span-1 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700" },
  { text: "探索未知领域", style: "col-span-1 bg-gradient-to-tr from-green-50 to-emerald-50 text-emerald-700" },
  { text: "思维漫游，即刻出发", style: "col-span-2 bg-gradient-to-r from-orange-50 to-amber-50 text-amber-700" },
  { text: "打破边界，重构想象", style: "col-span-1 bg-gradient-to-t from-fuchsia-50 to-rose-50 text-rose-700" },
  { text: "留下思绪...", style: "col-span-1 bg-gradient-to-bl from-cyan-50 to-blue-50 text-cyan-700" },
  { text: "如果思维有形状，它现在是什么样？", style: "col-span-2 bg-gradient-to-r from-slate-50 via-gray-50 to-zinc-50 border-dashed text-slate-600" },
];

const HeaderLogo = () => (
  <div className="relative group select-none w-10 h-10 flex-shrink-0">
    {/* Decorative Back Layer */}
    <div className="absolute -z-10 top-1 left-1 w-10 h-10 bg-gray-200/80 rounded-xl transform -rotate-6 transition-transform duration-300 group-hover:-rotate-12" />

    {/* Main Icon Container */}
    <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg shadow-gray-200 transform rotate-3 transition-transform duration-300 group-hover:rotate-6">
      {/* Styled 'Q' SVG */}
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Circle body of Q */}
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
        {/* Tail of Q */}
        <path d="M19 19l-3.5-3.5" />
      </svg>
    </div>
  </div>
);

export default function Chat() {
  const { messages, sendMessage, isLoading } = useChatBot();
  const [input, setInput] = useState('');
  
  // Use the extracted hook for scrolling logic
  const scrollRef = useAutoScroll([messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleGreetingClick = (text: string) => {
    if (isLoading) return;
    sendMessage(text);
  };

  return (
    // Outer container: 100dvh for mobile browsers
    // pb-[calc(64px+env(safe-area-inset-bottom))] reserves space for the Bottom Navigation Bar
    <div className="flex flex-col h-[100dvh] w-full bg-white text-slate-800 font-sans overflow-hidden pb-[calc(64px+env(safe-area-inset-bottom))]">
      
      {/* Header: Fixed Height, Light Blue Gradient */}
      <header className="flex-none h-16 px-4 flex items-center gap-3 bg-gradient-to-r from-sky-50 via-blue-50 to-white border-b border-blue-100/50 shadow-sm z-20">
        <HeaderLogo />
        <div className="flex flex-col justify-center h-full pt-1">
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 leading-none mb-0.5">
            Qbli
          </h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide">AI COMPANION</p>
        </div>
      </header>

      {/* Main Chat Area: Flexible height, Scrollable */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth relative bg-slate-50/30"
      >
        {messages.length === 0 ? (
          // Empty State: Centered Vertically and Horizontally
          <div className="min-h-full flex flex-col justify-center items-center p-4">
             <div className="w-full max-w-sm grid grid-cols-2 gap-3 transform -translate-y-8">
               {GREETINGS.map((greet, idx) => (
                 <button
                   key={idx}
                   onClick={() => handleGreetingClick(greet.text)}
                   className={`
                     relative overflow-hidden rounded-2xl p-3 text-left transition-all duration-200 active:scale-95
                     border border-white/60 shadow-sm hover:shadow-md
                     ${greet.style}
                   `}
                 >
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-semibold leading-relaxed">
                        {greet.text}
                      </p>
                      <ArrowUp className="opacity-40 rotate-45 flex-shrink-0 ml-1" size={14} />
                    </div>
                 </button>
               ))}
             </div>
          </div>
        ) : (
          // Message List
          <div className="p-4 space-y-5">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={index} 
                  className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[85%] gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar */}
                    <div className={`
                      flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center shadow-sm mt-0.5
                      ${isUser ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-100'}
                    `}>
                      {isUser ? <User size={14} /> : <Bot size={14} />}
                    </div>

                    {/* Bubble */}
                    <div 
                      className={`
                        px-4 py-2.5 text-sm md:text-base leading-relaxed shadow-sm
                        ${isUser 
                          ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' 
                          : 'bg-white border border-gray-100 text-slate-800 rounded-2xl rounded-tl-sm'
                        }
                      `}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start w-full">
                <div className="flex gap-2 max-w-[85%]">
                   <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-sm mt-0.5">
                      <Sparkles size={12} className="animate-pulse" />
                   </div>
                   <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                     <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                     <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                     <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></span>
                   </div>
                </div>
              </div>
            )}
            
            {/* Invisible spacer to ensure last message isn't hidden by absolute elements if any */}
            <div className="h-1" />
          </div>
        )}
      </div>

      {/* Input Area: Fixed Height, above bottom nav */}
      <div className="flex-none p-3 bg-white/90 backdrop-blur-md border-t border-gray-100 z-20">
        <div className="max-w-3xl mx-auto">
          <form 
            onSubmit={handleSubmit} 
            className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-full border border-gray-200 focus-within:border-indigo-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="与 Qbli 对话..."
              className="flex-1 bg-transparent border-none px-4 py-2 text-sm focus:outline-none text-slate-700 placeholder:text-slate-400 min-w-0"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`
                p-2 rounded-full flex-shrink-0 transition-all duration-200
                ${!input.trim() || isLoading 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                }
              `}
            >
              <Send size={16} className={isLoading ? 'opacity-0' : 'opacity-100'} />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}