import React, { useState, useEffect } from 'react';

const PHRASES = [
  "一起探索，一起发现",
  "捕捉灵感的每一个瞬间",
  "去未知的领域看看",
  "思维漫游，即刻出发",
  "今天有哪些想留下的思绪？",
  "打破边界，重构想象",
];

export default function ChatGreetings() {
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 2000;

  useEffect(() => {
    const i = loopNum % PHRASES.length;
    const fullText = PHRASES[i];

    let timer: ReturnType<typeof setTimeout>;

    if (isDeleting) {
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(fullText.substring(0, displayedText.length - 1));
        }, deletingSpeed);
      } else {
        // Finished deleting, switch to next phrase
        setIsDeleting(false);
        setLoopNum(prev => prev + 1);
      }
    } else {
      if (displayedText.length < fullText.length) {
        timer = setTimeout(() => {
          setDisplayedText(fullText.substring(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        // Finished typing, pause before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, loopNum]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto p-4">
      <style>{`
        @keyframes ballPulse {
          0%, 100% { 
            background-color: #4f46e5; /* indigo-600 */
            transform: scale(1);
            opacity: 1;
            box-shadow: 0 0 10px rgba(79, 70, 229, 0.3);
          }
          50% { 
            background-color: #818cf8; /* indigo-400 */
            transform: scale(0.85);
            opacity: 0.7;
            box-shadow: 0 0 0 rgba(79, 70, 229, 0);
          }
        }
        .cursor-ball {
          animation: ballPulse 1.5s infinite ease-in-out;
        }
      `}</style>

      <div className="min-h-[6rem] flex flex-col items-center justify-center">
        <h2 className="text-xl md:text-2xl font-medium text-slate-700 tracking-wide text-center leading-relaxed">
          {displayedText}
          <span className="cursor-ball ml-2 inline-block w-3 h-3 rounded-full align-middle mb-1" />
        </h2>
        
        {/* Decorative subtle element below text */}
        <div className="mt-6 w-16 h-1 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full opacity-60"></div>
      </div>
    </div>
  );
}