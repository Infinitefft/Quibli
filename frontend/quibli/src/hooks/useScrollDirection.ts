import { useState, useEffect, useRef } from 'react';
import { throttle } from '@/utils/Throttle';

export const useScrollDirection = (elementRef?: React.RefObject<HTMLElement>) => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  
  const lastScrollY = useRef(0);
  const currentDirection = useRef<'up' | 'down' | null>(null);

  useEffect(() => {
    // 确定监听目标：如果有 ref 且 current 存在，则监听该元素，否则监听 window
    const scrollTarget = elementRef?.current || window;

    const updateScrollDir = throttle(() => {
      // 获取滚动距离：根据监听目标不同，获取方式不同
      const scrollY = elementRef?.current ? elementRef.current.scrollTop : window.scrollY;
      
      const direction = scrollY > lastScrollY.current ? 'down' : 'up';

      const newIsAtTop = scrollY < 10;
      setIsAtTop(newIsAtTop);
      
      if (direction !== currentDirection.current) {
        if (Math.abs(scrollY - lastScrollY.current) > 5) {
          setScrollDirection(direction);
          currentDirection.current = direction;
          lastScrollY.current = scrollY > 0 ? scrollY : 0;
        }
      } else {
        lastScrollY.current = scrollY > 0 ? scrollY : 0;
      }
    }, 50);

    scrollTarget.addEventListener('scroll', updateScrollDir as EventListener);
    return () => scrollTarget.removeEventListener('scroll', updateScrollDir as EventListener);
  }, [elementRef]); // 依赖 elementRef

  return { scrollDirection, isAtTop };
};