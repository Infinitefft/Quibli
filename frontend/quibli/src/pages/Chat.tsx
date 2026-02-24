import React, { useState, useEffect } from 'react'; // 新增 useEffect
import { Send, Sparkles, User, Bot, RotateCcw } from 'lucide-react';
import { useChatBot, useAutoScroll } from '@/hooks/useChatBot';
import ChatGreetings from '@/components/ui/ChatGreetings';
import BottomNav from '@/components/BottomNav';
import BackToBottom from '@/components/BackToBottom';
import { useChatStore } from '@/store/chatStore';



const HeaderLogo = () => (
  <div className="relative group select-none w-10 h-10 flex-shrink-0">
    <div className="absolute -z-10 top-1 left-1 w-10 h-10 bg-gray-200/80 rounded-xl transform -rotate-6 transition-transform duration-300 group-hover:-rotate-12" />
    <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg shadow-gray-200 transform rotate-3 transition-transform duration-300 group-hover:rotate-6">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
        <path d="M19 19l-3.5-3.5" />
      </svg>
    </div>
  </div>
);

export default function Chat() {
  // 严格保留原有的 hook
  const { messages, sendMessage, isLoading, setMessages } = useChatBot() as any; 
  const [input, setInput] = useState('');
  
  // 新增：从持久化 Store 获取数据
  const { storedMessages, setStoredMessages, clearStoredMessages } = useChatStore() as any;

  // 新增：初始化时将本地存储同步到 useChatBot
  useEffect(() => {
    if (storedMessages && storedMessages.length > 0 && messages.length === 0) {
      setMessages(storedMessages);
    }
  }, []);

  // 新增：当消息变化时，同步到本地存储
  useEffect(() => {
    if (messages.length > 0) {
      setStoredMessages(messages);
    }
  }, [messages, setStoredMessages]);

  const scrollRef = useAutoScroll([messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  // 修改：清空逻辑增加对持久化 Store 的清理
  const handleReset = () => {
    clearStoredMessages();
    window.location.reload();
  };

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="flex flex-col h-[100dvh] w-full bg-slate-50 font-sans overflow-hidden relative">
        
        {/* 1. Header: 适配手机状态栏 */}
        <header className="fixed top-0 left-0 right-0 h-24 pt-10 px-4 flex items-center gap-3 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 touch-none">
          <HeaderLogo />
          <div className="flex flex-col justify-center h-full pt-1">
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 leading-none mb-0.5">
              Qlib
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">AI COMPANION</p>
          </div>
          <button 
            onClick={handleReset} // 改为调用清理函数
            className="ml-auto p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
          >
            <RotateCcw size={20} />
          </button>
        </header>

        {/* 2. Main Chat Area */}
        <div 
          ref={scrollRef}
          className={`
            flex-1 relative pt-28 pb-36 no-scrollbar
            ${messages.length === 0 
              ? 'overflow-hidden touch-none overscroll-none' 
              : 'overflow-y-auto overscroll-y-contain'
            }
          `}
          style={{
            background: 'linear-gradient(to bottom, #f8fafc, #eff6ff)'
          }}
        >
          {messages.length === 0 ? (
            <div className="min-h-full flex flex-col justify-center items-center p-6">
               <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-blue-100/40 rounded-full blur-3xl pointer-events-none mix-blend-multiply animate-pulse" />
               <div className="absolute bottom-[30%] left-[10%] w-72 h-72 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none mix-blend-multiply animate-pulse [animation-delay:2s]" />
               
               <div className="z-10 w-full transform -translate-y-8">
                 <ChatGreetings />
               </div>
            </div>
          ) : (
            <div className="px-4 py-6 space-y-6">
              {messages.map((msg: any, index: number) => {
                const isUser = msg.role === 'user';
                return (
                  <div 
                    key={index} 
                    className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div className={`flex max-w-[85%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`
                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm mt-0.5
                        ${isUser 
                          ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white' 
                          : 'bg-white text-indigo-600 border border-indigo-50 shadow-indigo-100/50'
                        }
                      `}>
                        {isUser ? <User size={15} /> : <Bot size={15} />}
                      </div>

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

        {/* 3. Input Area */}
        <div className="fixed bottom-[64px] left-0 right-0 z-40 bg-white/85 backdrop-blur-md border-t border-gray-100/50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] touch-none">
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
                    p-2.5 rounded-full flex-shrink-0 transition-all duration-200 shadow-sm relative
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
          
        {messages.length > 0 && (
          <BackToBottom targetRef={scrollRef as React.RefObject<HTMLDivElement>} />
        )}
        <BottomNav />
      </div>
    </>
  );
}