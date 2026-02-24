import React, { useState, useEffect, useCallback } from 'react';
import { throttle } from '@/utils/Throttle';

interface BackToBottomProps {
  targetRef: React.RefObject<HTMLDivElement>;
  threshold?: number;
  right?: number;
  bottom?: number;
  tabBarHeight?: number;
  inputAreaHeight?: number;
}

const BackToBottom: React.FC<BackToBottomProps> = ({ 
  targetRef,
  threshold = 300, 
  right = 16, 
  bottom = 20,
  tabBarHeight = 64,
  inputAreaHeight = 70
}) => {
  const [visible, setVisible] = useState(false);

  const checkScroll = useCallback(
    throttle(() => {
      if (targetRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = targetRef.current;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        setVisible(distanceFromBottom > threshold);
      }
    }, 200),
    [threshold, targetRef]
  );

  useEffect(() => {
    const el = targetRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [checkScroll, targetRef]);

  const handleToBottom = () => {
    if (targetRef.current) {
      targetRef.current.scrollTo({
        top: targetRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleToBottom}
      style={{
        position: 'fixed',
        right: `${right}px`,
        bottom: `${tabBarHeight + inputAreaHeight + bottom}px`,
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="#666" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </div>
  );
};

export default BackToBottom;