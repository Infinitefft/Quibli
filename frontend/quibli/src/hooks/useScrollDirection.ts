import { useState, useRef, useCallback } from 'react';
import { throttle } from '@/utils/Throttle';

export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  
  const lastScrollY = useRef(0);

  // We define the throttled logic separately. 
  // It receives the scroll position (number) instead of the event object.
  // This is crucial because React reuses/nullifies event objects, so accessing properties
  // like currentTarget.scrollTop asynchronously (inside throttle) fails.
  const processScroll = useCallback(
    throttle((currentScrollY: number) => {
      const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';
      
      const newIsAtTop = currentScrollY < 10;
      setIsAtTop(newIsAtTop);

      if (Math.abs(currentScrollY - lastScrollY.current) > 5) {
        setScrollDirection(direction);
      }

      lastScrollY.current = currentScrollY > 0 ? currentScrollY : 0;
    }, 50),
    []
  );

  // The event handler extracts scrollTop synchronously and passes it to the throttled function
  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    processScroll(currentScrollY);
  }, [processScroll]);

  return { scrollDirection, isAtTop, handleScroll };
};