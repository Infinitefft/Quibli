import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import InfiniteScroll from '@/components/InfiniteScroll';

/**
 * 首页 Feed：对 @tanstack/react-virtual 的 `useVirtualizer` 封装（与手写 VirtualList 无关）。
 *
 * 库的用法说明、API 摘要、最小 Demo 见：`VirtualList.example.tsx`（`pnpm add @tanstack/react-virtual`）。
 *
 * 结构要点：
 * - 滚动根：ref={scrollRef}，固定 height + overflow:auto；
 * - 总高：virtualizer.getTotalSize()；
 * - 可见行：getVirtualItems()，absolute + translateY(start)；
 * - estimateSize 与真实卡片高度需一致，否则空白或裁切（见 ESTIMATE_*）。
 */
/** 与 PostsItem 卡片+间距大致匹配（px） */
export const ESTIMATE_POST_ROW = 280;
/** 与 QuestionsItem 大致匹配（px） */
export const ESTIMATE_QUESTION_ROW = 200;

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

/** 首页 Feed：TanStack 虚拟行 + 底部 InfiniteScroll 哨兵（加载更多） */
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
    // 必须与 scrollRef 指向同一 DOM，库才能订阅 scroll/resize 并计算可见区间
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    // 视口外多画几行，快速滑动时不易露底
    overscan: 8,
  });

  return (
    <div
      ref={scrollRef}
      className={scrollClassName}
      style={{ height, overflowY: 'auto' }}
      onScroll={onScroll}
    >
      {/* 哨兵在内容块之后，随滚动进入视口触发 onLoadMore；总高度需包含虚拟列表占位 */}
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
                {/* 卡片组件自带 margin-bottom，用选择器去掉避免虚拟行高度与 estimate 不一致 */}
                <div className="[&>*]:!mb-0">{renderItem(item, v.index)}</div>
              </div>
            );
          })}
        </div>
      </InfiniteScroll>
    </div>
  );
}
