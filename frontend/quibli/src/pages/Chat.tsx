import React, { useRef, useEffect, useState } from 'react';
import { useChatBot } from '@/hooks/useChatBot';
import { Send, Bot, User, StopCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Chat() {
  const { messages, isLoading, sendMessage, stopGeneration } = useChatBot();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center px-4 h-14 bg-white border-b border-gray-200 shadow-sm flex-shrink-0 z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-blue-200 shadow-sm">
                <Sparkles className="w-5 h-5" />
            </div>
            <div>
                <h1 className="text-base font-bold text-gray-900 leading-none">Quibli AI</h1>
                <span className="text-xs text-green-500 font-medium flex items-center mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
                    Online
                </span>
            </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-60">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bot className="w-10 h-10 stroke-1 text-gray-500" />
                </div>
                <p className="text-sm font-medium">有什么我可以帮你的吗？</p>
            </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-white text-blue-600 border border-gray-100'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Bubble */}
              <div className={`group relative px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gray-900 text-white rounded-tr-sm' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
              }`}>
                <div className="whitespace-pre-wrap break-words">
                    {msg.content}
                    {msg.role === 'model' && isLoading && msg.id === messages[messages.length - 1].id && (
                        <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-blue-500 animate-pulse" />
                    )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-center max-w-4xl mx-auto">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入消息..."
            className="w-full h-12 pl-5 pr-12 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-full text-sm transition-all outline-none"
            disabled={isLoading}
          />
          
          <div className="absolute right-2 flex items-center">
            {isLoading ? (
                <button
                    type="button"
                    onClick={stopGeneration}
                    className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                    title="Stop generation"
                >
                    <StopCircle className="w-5 h-5" />
                </button>
            ) : (
                <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    <Send className="w-4 h-4 ml-0.5" />
                </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}