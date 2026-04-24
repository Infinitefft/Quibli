import type { UIEvent } from 'react';

/**
 * 由 `HomeFeedLayout` 通过 `<Outlet context={...} />` 下发给子路由（文章/问答面板）。
 * 子组件用 `useOutletContext<HomeFeedOutletContext>()` 读取，避免层层 props 透传。
 */
export type HomeFeedOutletContext = {
  /** 列表可视区域高度（px）：ResizeObserver 测量，用于虚拟列表 height 与骨架滚动容器 */
  listViewportHeight: number;
  /**
   * 列表 onScroll：根据 scrollTop 驱动顶栏 translate、搜索条透明度等。
   * 注意：骨架态与虚拟列表态共用同一 scrollRef 时，事件都走这里。
   */
  handleScroll: (e: UIEvent<HTMLDivElement>) => void;
  /**
   * 当子路由切换、或骨架↔列表切换导致滚动节点「内容变了但 scrollTop 还在」时，
   * 用当前 DOM 的 scrollTop 重置 lastScrollY 等内部参考，避免顶栏错位跳动。
   */
  syncScrollOrigin: (scrollTop: number) => void;
};
