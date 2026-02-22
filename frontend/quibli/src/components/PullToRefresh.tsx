import React, { useState, useRef, TouchEvent, RefObject, useEffect, useCallback } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  scrollableElementRef?: RefObject<HTMLElement>;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children, scrollableElementRef }) => {
  const [startY, setStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isPulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const THRESHOLD = 70;
  const MAX_PULL = 120;

  const getScrollTop = useCallback(() => {
    return scrollableElementRef?.current?.scrollTop ?? window.scrollY;
  }, [scrollableElementRef]);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (isRefreshing) return;
    
    // 只有在滚动条位于顶部时，才允许启动下拉逻辑
    if (getScrollTop() <= 0) {
      setStartY(e.touches[0].clientY);
      isPulling.current = true;
    } else {
      isPulling.current = false;
    }
  };

  const handleTouchMove = useCallback((e: globalThis.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    const scrollTop = getScrollTop();

    // 如果用户在下拉过程中页面发生了滚动（不在顶部了），立即终止下拉逻辑
    if (scrollTop > 0) {
      isPulling.current = false;
      if (translateY !== 0) setTranslateY(0);
      return;
    }

    // 关键修复点：只有在下拉 (diff > 0) 且处于顶部时才处理
    if (diff > 0) {
      // 只有事件可取消时才调用 preventDefault，避免浏览器 Intervention 警告
      if (e.cancelable) {
        e.preventDefault();
      }
      
      const pullDistance = Math.min(diff * 0.4, MAX_PULL);
      setTranslateY(pullDistance);
    } else {
      // 如果是向上滑动，重置状态
      if (translateY !== 0) setTranslateY(0);
    }
  }, [isRefreshing, startY, getScrollTop, translateY]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // 显式绑定非 passive 事件，以便能够成功调用 preventDefault
    const handleMove = (e: globalThis.TouchEvent) => {
      handleTouchMove(e);
    };

    element.addEventListener('touchmove', handleMove, { passive: false });

    return () => {
      element.removeEventListener('touchmove', handleMove);
    };
  }, [handleTouchMove]);

  const handleTouchEnd = async () => {
    if (!isPulling.current || isRefreshing) return;
    isPulling.current = false;

    if (translateY > THRESHOLD) {
      setIsRefreshing(true);
      setTranslateY(THRESHOLD);

      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setTranslateY(0);
          setStartY(0);
        }, 500);
      }
    } else {
      setTranslateY(0);
      setStartY(0);
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        backgroundColor: 'inherit',
        // 动态 touchAction：下拉时设为 none 以锁定浏览器默认行为
        touchAction: translateY > 0 ? 'none' : 'pan-y',
        // 使用 translate3d 开启 GPU 加速
        transform: `translate3d(0, ${translateY}px, 0)`,
        transition: isRefreshing ? 'transform 0.2s' : 'transform 0.3s ease-out',
        willChange: 'transform'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: `-${THRESHOLD}px`,
          left: 0,
          width: '100%',
          height: `${THRESHOLD}px`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {isRefreshing ? (
          <div className="spinner" style={{
            width: '24px',
            height: '24px',
            border: '3px solid #e0e0e0',
            borderTopColor: '#3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        ) : (
          <span style={{ 
            color: '#888', 
            fontSize: '14px', 
            opacity: Math.min(translateY / THRESHOLD, 1) 
          }}>
            {translateY > THRESHOLD ? '释放刷新' : '下拉刷新'}
          </span>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {children}
    </div>
  );
};