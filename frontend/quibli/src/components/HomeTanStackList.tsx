import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import InfiniteScroll from '@/components/InfiniteScroll';

/** 与 PostsItem 卡片+间距大致匹配 */
export const ESTIMATE_POST_ROW = 280;
/** 与 QuestionsItem 大致匹配 */
export const ESTIMATE_QUESTION_ROW = 300;

type HomeTanStackListProps<T> = {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  items: T[];
  estimateSize: number;
  /** 滚动容器可视高度（px） */
  height: number;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  scrollClassName?: string;
};

/**
 * 首页 Feed：@tanstack/react-virtual 固定预估行高 + 现有 InfiniteScroll。
 */
export function HomeTanStackList<T>({
  scrollRef,
  items,
  estimateSize,
  height,
  onScroll,
  hasMore,
  isLoading,
  onLoadMore,
  renderItem,
  scrollClassName = '',
}: HomeTanStackListProps<T>) {
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    overscan: 8,
  });

  return (
    <div
      ref={scrollRef}
      className={scrollClassName}
      style={{ height, overflowY: 'auto' }}
      onScroll={onScroll}
    >
      <InfiniteScroll hasMore={hasMore} isLoading={isLoading} onLoadMore={onLoadMore}>
        <div
          className="pb-4 bg-gray-50 relative w-full"
          style={{
            height: virtualizer.getTotalSize(),
          }}
        >
          {virtualizer.getVirtualItems().map((v) => {
            const item = items[v.index];
            if (item == null) return null;
            return (
              <div
                key={v.key}
                data-index={v.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: v.size,
                  transform: `translateY(${v.start}px)`,
                }}
              >
                <div className="[&>*]:!mb-0">{renderItem(item, v.index)}</div>
              </div>
            );
          })}
        </div>
      </InfiniteScroll>
    </div>
  );
}
