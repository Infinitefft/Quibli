import React from 'react';
import { useVirtualList } from '@/hooks/useVirtualList';

interface VirtualListProps<T> {
  // 列表数据
  list: T[];
  // 每个列表项的高度
  itemHeight: number;
  // 容器高度
  containerHeight: number;
  // 缓冲区数量
  overscan?: number;
  // 渲染每一项的函数
  renderItem: (item: T, index: number) => React.ReactNode;
  // 容器的 className
  className?: string;
  // 滚动事件（可选，用于配合 InfiniteScroll）
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

/**
 * 虚拟列表组件
 * 
 * 使用示例：
 * <VirtualList
 *   list={posts}
 *   itemHeight={200}
 *   containerHeight={window.innerHeight}
 *   renderItem={(post, index) => <PostsItem key={post.id} post={post} />}
 * />
 */
function VirtualList<T = any>({
  list,
  itemHeight,
  containerHeight,
  overscan = 3,
  renderItem,
  className = '',
  onScroll: externalOnScroll,
}: VirtualListProps<T>) {
  
  const {
    visibleList,
    totalHeight,
    offsetY,
    onScroll,
    containerRef,
  } = useVirtualList({
    list,
    itemHeight,
    containerHeight,
    overscan,
  });

  // 合并内部和外部的 onScroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll(e);
    externalOnScroll?.(e);
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* 外层容器：撑开滚动条 */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* 可见区域容器：使用 transform 定位 */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            // 使用 will-change 优化性能
            willChange: 'transform',
          }}
        >
          {visibleList.map(({ data, index }) => (
            <div
              key={index}
              style={{
                height: itemHeight,
                // 防止内容溢出
                overflow: 'hidden',
              }}
            >
              {renderItem(data, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VirtualList;
