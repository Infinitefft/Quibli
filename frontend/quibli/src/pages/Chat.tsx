import React, { useState } from 'react';
import { Send, Sparkles, User, Bot, RotateCcw } from 'lucide-react';
import { useChatBot, useAutoScroll } from '@/hooks/useChatBot';
import ChatGreetings from '@/components/ui/ChatGreetings';
import BottomNav from '@/components/BottomNav';

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

  return (
    <>
      {/* Inject custom styles to hide scrollbar cross-browser */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      {/* Flex Column Container: Full viewport height */}
      <div className="flex flex-col h-[100dvh] w-full bg-slate-50 font-sans overflow-hidden relative">
        
        {/* 1. Header: Fixed Top */}
        <header className="fixed top-0 left-0 right-0 h-16 px-4 flex items-center gap-3 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 touch-none">
          <HeaderLogo />
          <div className="flex flex-col justify-center h-full pt-1">
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 leading-none mb-0.5">
              Qlib
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">AI COMPANION</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="ml-auto p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
          >
            <RotateCcw size={20} />
          </button>
        </header>

        {/* 2. Main Chat Area */}
        {/* 
            - Removed 'scroll-smooth' from CSS to improve native touch momentum feel (JS hook handles auto-scroll animation).
            - Added 'overscroll-y-contain' to prevent "double scroll" or boundary chaining effects at the bottom.
            - Added 'touch-none' & 'overscroll-none' for empty state to lock it completely.
        */}
        <div 
          ref={scrollRef}
          className={`
            flex-1 relative pt-16 pb-36 no-scrollbar
            ${messages.length === 0 
              ? 'overflow-hidden touch-none overscroll-none' 
              : 'overflow-y-auto overscroll-y-contain'
            }
          `}
          style={{
            background: 'linear-gradient(to bottom, #f8fafc, #eff6ff)' // slate-50 to blue-50
          }}
        >
          {messages.length === 0 ? (
            // Empty State
            <div className="min-h-full flex flex-col justify-center items-center p-6">
               {/* Ambient Background Blobs */}
               <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-blue-100/40 rounded-full blur-3xl pointer-events-none mix-blend-multiply animate-pulse" />
               <div className="absolute bottom-[30%] left-[10%] w-72 h-72 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none mix-blend-multiply animate-pulse [animation-delay:2s]" />
               
               <div className="z-10 w-full transform -translate-y-12">
                 <ChatGreetings />
               </div>
            </div>
          ) : (
            // Message List
            <div className="px-4 py-6 space-y-6">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div 
                    key={index} 
                    className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div className={`flex max-w-[85%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      
                      {/* Avatar */}
                      <div className={`
                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm mt-0.5
                        ${isUser 
                          ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white' 
                          : 'bg-white text-indigo-600 border border-indigo-50 shadow-indigo-100/50'
                        }
                      `}>
                        {isUser ? <User size={15} /> : <Bot size={15} />}
                      </div>

                      {/* Bubble */}
                      <div 
                        className={`
                          px-5 py-3 text-[15px] leading-relaxed shadow-sm
                          ${isUser 
                            ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-2xl rounded-tr-sm shadow-indigo-200' 
                            : 'bg-white border border-gray-100 text-slate-700 rounded-2xl rounded-tl-sm shadow-gray-100'
                          }
                        `}
                      >
                        <p className="whitespace-pre-wrap break-words font-normal tracking-wide">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start w-full animate-in fade-in duration-300">
                  <div className="flex gap-3 max-w-[85%]">
                     <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white text-indigo-600 border border-indigo-50 flex items-center justify-center shadow-sm mt-0.5">
                        <Sparkles size={14} className="animate-pulse" />
                     </div>
                     <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                       <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                       <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                       <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                     </div>
                  </div>
                </div>
              )}
              
              <div className="h-2" />
            </div>
          )}
        </div>

        {/* 3. Input Area - Fixed Position */}
        <div className="fixed bottom-[64px] left-0 right-0 z-40 bg-white/85 backdrop-blur-md border-t border-gray-100/50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
          <div className="max-w-3xl mx-auto p-3">
              <form 
                onSubmit={handleSubmit} 
                className="flex items-center gap-2 p-1.5 bg-slate-50/80 rounded-full border border-gray-200 focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 transition-all duration-300 shadow-sm"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="与 Qlib 对话..."
                  className="flex-1 bg-transparent border-none px-4 py-2.5 text-sm focus:outline-none text-slate-700 placeholder:text-slate-400 min-w-0"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={`
                    p-2.5 rounded-full flex-shrink-0 transition-all duration-200 shadow-sm
                    ${!input.trim() || isLoading 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-200'
                    }
                  `}
                >
                  <Send size={18} className={isLoading ? 'opacity-0' : 'opacity-100'} />
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </button>
              </form>
          </div>
        </div>
          
        {/* Bottom Navigation (Fixed bottom-0) */}
        <BottomNav />
      </div>
    </>
  );
}