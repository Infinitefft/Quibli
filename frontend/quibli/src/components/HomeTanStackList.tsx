import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import InfiniteScroll from '@/components/InfiniteScroll';

/**
 * 首页 Feed 虚拟列表封装：把 @tanstack/react-virtual 的 `useVirtualizer` 接到固定高度的滚动容器上。
 * 更细的「为什么这样写」见函数体里的分步注释；库级 Demo 可参考项目里的 `VirtualList.example.tsx`。
 */
/** 预估行高（px）：尽量接近 PostsItem 真实高度，虚拟列表才能对齐、少闪烁 */
export const ESTIMATE_POST_ROW = 280;
/** 预估行高（px）：尽量接近 QuestionsItem 真实高度 */
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

/** 首页 Feed：TanStack 虚拟行 + InfiniteScroll（列表底部哨兵触发加载更多） */
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
  // 步骤 1：创建虚拟化器 —— 它只负责「算哪些行该画、每行 top/height」
  const virtualizer = useVirtualizer({
    // 1.1 数据条数：变长列表随 items.length 变化，虚拟器会重算总高度与可见窗口
    count: items.length,
    // 1.2 告诉库「谁在滚动」：必须和下面外层 div 的 ref={scrollRef} 是同一个节点
    //     否则库读不到 scrollTop，getVirtualItems() 会一直认为在顶部
    getScrollElement: () => scrollRef.current,
    // 1.3 每行预估高度：首屏与未测量行用这个值占位；和真实 DOM 差太多会出现大块空白或重叠
    estimateSize: () => estimateSize,
    // 1.4 overscan：在可视区域上下多渲染几行，快速滑动时减少「白屏一闪」
    overscan: 8,
  });

  return (
    // 步骤 2：滚动根容器 —— 固定 height + overflow:auto，形成独立滚动上下文
    <div
      ref={scrollRef}
      className={scrollClassName}
      style={{ height, overflowY: 'auto' }}
      // 2.1 把滚动事件交给父级（首页壳）做顶栏隐藏/搜索条渐隐等
      onScroll={onScroll}
    >
      {/*
        步骤 3：InfiniteScroll 包在「可滚动内容」外侧
        3.1 内部会在列表末尾放哨兵（IntersectionObserver），滚到底附近触发 onLoadMore
        3.2 注意：总可滚动高度 = 内层占位 div 的 height（见下一步），哨兵随内容变长才能反复触发
      */}
      <InfiniteScroll hasMore={hasMore} isLoading={isLoading} onLoadMore={onLoadMore}>
        {/*
          步骤 4：撑开滚动条高度的「轨道」
          4.1 height = getTotalSize()：用「预估/已测量」的行高之和模拟完整列表高度
          4.2 relative：子行用 absolute 贴在这条轨道上；pb-4 与真实列表留白一致
        */}
        <div
          className="pb-4 bg-gray-50 relative w-full"
          style={{
            height: virtualizer.getTotalSize(),
          }}
        >
          {/*
            步骤 5：只渲染当前视口附近的行（+ overscan）
            5.1 v.index：逻辑下标；v.start / v.size：这一行在「总列表」里的像素偏移与高度
            5.2 用 absolute + translateY(v.start) 把该行摆到正确纵向位置（虚拟列表经典写法）
          */}
          {virtualizer.getVirtualItems().map((v) => {
            const item = items[v.index];
            // 5.3 若数据尚未同步到该下标，跳过避免渲染 undefined
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
                  // 高度用 v.size：库在动态测量后可能调整，比写死 estimate 更准
                  height: v.size,
                  transform: `translateY(${v.start}px)`,
                }}
              >
                {/*
                  步骤 6：抹平卡片自带下边距
                  6.1 许多 Item 组件内部有 mb-*，若保留则「真实占位 > estimate」会破坏虚拟行对齐
                  6.2 [&>*]:!mb-0 强制子根元素 margin-bottom 为 0，让行高更接近 estimateSize
                */}
                <div className="[&>*]:!mb-0">{renderItem(item, v.index)}</div>
              </div>
            );
          })}
        </div>
      </InfiniteScroll>
    </div>
  );
}
