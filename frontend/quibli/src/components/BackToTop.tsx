import React, { useState, useEffect, useCallback } from 'react';
import { throttle } from '@/utils/Throttle';

interface BackToTopProps {
  threshold?: number;
  right?: number;
  bottom?: number;
  tabBarHeight?: number;
}

const BackToTop: React.FC<BackToTopProps> = ({ 
  threshold = 300, 
  right = 16, 
  bottom = 20,
  tabBarHeight = 65
}) => {
  const [visible, setVisible] = useState(false);

  const checkScroll = useCallback(
    throttle(() => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      setVisible(scrollY > threshold);
    }, 200),
    [threshold]
  );

  useEffect(() => {
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, [checkScroll]);

  const handleToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleToTop}
      style={{
        position: 'fixed',
        right: `${right}px`,
        bottom: `${tabBarHeight + bottom}px`,
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
        WebkitTapHighlightColor: 'transparent',
        transition: 'opacity 0.3s'
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
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    </div>
  );
};

export default BackToTop;