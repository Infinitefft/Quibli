import React, { forwardRef } from 'react';
import { Virtuoso } from 'react-virtuoso';
import InfiniteScroll from '@/components/InfiniteScroll';

/**
 * 首页 Feed 虚拟列表封装：使用 react-virtuoso 替代 @tanstack/react-virtual。
 */
/** 预估行高（px）：尽量接近 PostsItem 真实高度，虚拟列表才能对齐、少闪烁 */
export const ESTIMATE_POST_ROW = 280;
/** 预估行高（px）：尽量接近 QuestionsItem 真实高度 */
export const ESTIMATE_QUESTION_ROW = 200;

type HomeVirtuosoListProps<T> = {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  items: T[];
  estimateSize: number;
  /** 滚动容器可视高度（px） */
  height: number;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onPrefetch?: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  scrollClassName?: string;
};

/** 首页 Feed：Virtuoso 虚拟行 + InfiniteScroll（列表底部哨兵触发加载更多） */
export function HomeVirtuosoList<T>({
  scrollRef,
  items,
  estimateSize,
  height,
  onScroll,
  hasMore,
  isLoading,
  onLoadMore,
  onPrefetch,
  renderItem,
  scrollClassName = '',
}: HomeVirtuosoListProps<T>) {
  // 自定义 Scroller 组件以绑定 onScroll 事件
  const Scroller = React.useMemo(() => {
    return forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>((props, ref) => {
      return (
        <div
          {...props}
          ref={ref}
          onScroll={(e) => {
            // 触发外部传入的 onScroll 逻辑（如顶栏联动）
            onScroll(e);
            // 触发 Virtuoso 内部的 onScroll 逻辑
            if (props.onScroll) {
              props.onScroll(e);
            }
          }}
        />
      );
    });
  }, [onScroll]);

  return (
    <Virtuoso
      scrollerRef={(ref) => {
        // 将 Virtuoso 内部的滚动容器 ref 暴露给外部（用于回到顶部等操作）
        if (scrollRef) {
          (scrollRef as React.MutableRefObject<HTMLElement | null>).current = ref as HTMLElement;
        }
      }}
      className={scrollClassName}
      style={{ height, overflowY: 'auto' }}
      data={items}
      defaultItemHeight={estimateSize}
      overscan={800}  // 提前渲染的像素高度，减少快速滚动时的白屏
      itemContent={(index, item) => (
        // overflow-hidden 创建 BFC，防止子元素的 margin 发生折叠，确保 Virtuoso 测量的高度完全包含 margin
        <div className="overflow-hidden">
          {renderItem(item, index)}
        </div>
      )}
      components={{
        Scroller,
        // 将 InfiniteScroll 作为 Virtuoso 的 Footer，实现在列表底部渲染哨兵元素
        Footer: () => (
          <InfiniteScroll 
            hasMore={hasMore} 
            isLoading={isLoading} 
            onLoadMore={onLoadMore} 
            onPrefetch={onPrefetch}
          >
            {/* InfiniteScroll 内部会在 children 后面渲染哨兵 div */}
            <div />
          </InfiniteScroll>
        )
      }}
    />
  );
}
