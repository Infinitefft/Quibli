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
  
  // 阈值：下拉多少像素触发刷新
  const THRESHOLD = 70;
  // 最大下拉距离
  const MAX_PULL = 120;

  const getScrollTop = useCallback(() => {
    return scrollableElementRef?.current?.scrollTop ?? window.scrollY;
  }, [scrollableElementRef]);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    // 只有当页面滚动在顶部时才记录起点
    if (isRefreshing) return;
    if (getScrollTop() === 0) {
      setStartY(e.touches[0].clientY);
      isPulling.current = true;
    } else {
      isPulling.current = false;
    }
  };

  const handleTouchMove = useCallback((e: globalThis.TouchEvent) => {
    // 如果不在顶部或者正在刷新，不处理
    if (!isPulling.current || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    if (getScrollTop() > 5) { // Add a small tolerance
      isPulling.current = false;
      setTranslateY(0);
      return;
    }

    // 只有向下拉动才处理
    if (diff > 0) {
      e.preventDefault(); // Prevent parent scroll, now safe to call
      // 增加阻尼感 (diff * 0.4)
      const pullDistance = Math.min(diff * 0.4, MAX_PULL);
      setTranslateY(pullDistance);
    } else {
      setTranslateY(0);
    }
  }, [isRefreshing, startY, getScrollTop]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

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
      // 触发刷新
      setIsRefreshing(true);
      setTranslateY(THRESHOLD); // 停留在加载位置

      try {
        await onRefresh();
      } finally {
        // 刷新完成，延时收起
        setTimeout(() => {
          setIsRefreshing(false);
          setTranslateY(0);
          setStartY(0);
        }, 500);
      }
    } else {
      // 未达到阈值，回弹
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
        touchAction: 'pan-y',
        transform: `translateY(${translateY}px)`,
        transition: isRefreshing ? 'transform 0.2s' : 'transform 0.3s ease-out',
      }}
    >
      {/* 下拉加载指示器 */}
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
          <span style={{ color: '#888', fontSize: '14px', opacity: translateY / THRESHOLD }}>
            {translateY > THRESHOLD ? '释放刷新' : '下拉刷新'}
          </span>
        )}
      </div>

      {/* 注入简单的动画样式 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* 内容区域 */}
      {children}
    </div>
  );
};