/**
 * 虚拟列表使用示例
 * 
 * 这个文件展示了如何在 Home.tsx 中使用虚拟列表
 */

import React from 'react';
import VirtualList from '@/components/VirtualList';
import InfiniteScroll from '@/components/InfiniteScroll';
import PostsItem from '@/components/post/PostsItem';
import useHomePostStore from '@/store/homePost';

// ============================================
// 示例 1: 基础用法（只使用虚拟列表）
// ============================================
function Example1_BasicUsage() {
  const { posts } = useHomePostStore();

  return (
    <VirtualList
      list={posts}
      itemHeight={200}  // 假设每个 PostsItem 高度是 200px
      containerHeight={window.innerHeight - 145}  // 减去 header 高度
      renderItem={(post, index) => (
        <PostsItem key={post.id} post={post} />
      )}
    />
  );
}

// ============================================
// 示例 2: 配合 InfiniteScroll 使用（推荐）
// ============================================
function Example2_WithInfiniteScroll() {
  const { posts, loadMorePosts, hasMorePosts, loadingPosts } = useHomePostStore();

  return (
    <div className="h-full overflow-y-auto">
      <InfiniteScroll
        onLoadMore={loadMorePosts}
        hasMore={hasMorePosts}
        isLoading={loadingPosts}
      >
        <VirtualList
          list={posts}
          itemHeight={200}
          containerHeight={window.innerHeight - 145}
          renderItem={(post, index) => (
            <PostsItem key={post.id} post={post} />
          )}
        />
      </InfiniteScroll>
    </div>
  );
}

// ============================================
// 示例 3: 在 Home.tsx 中的完整集成
// ============================================
function Example3_HomeIntegration() {
  const { posts, loadMorePosts, hasMorePosts, loadingPosts } = useHomePostStore();
  const postsContainerRef = React.useRef<HTMLDivElement>(null);

  // 处理滚动事件（用于 header 隐藏逻辑）
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // 你原来的 header 隐藏逻辑
    console.log('scrollTop:', e.currentTarget.scrollTop);
  };

  return (
    <div 
      ref={postsContainerRef}
      className="w-screen h-full overflow-y-auto no-scrollbar pt-[145px] pb-24"
      onScroll={handleScroll}
    >
      <InfiniteScroll
        onLoadMore={loadMorePosts}
        hasMore={hasMorePosts}
        isLoading={loadingPosts}
      >
        {/* 方案 A: 使用虚拟列表组件 */}
        <VirtualList
          list={posts}
          itemHeight={200}
          containerHeight={window.innerHeight - 145}
          renderItem={(post, index) => (
            <PostsItem key={post.id} post={post} />
          )}
        />

        {/* 方案 B: 直接使用 Hook（更灵活） */}
        {/* 
        <div className="pb-4 bg-gray-50">
          {visiblePosts.map(({ data: post, index }) => (
            <PostsItem key={`${post.id}-${index}`} post={post} />
          ))}
        </div>
        */}
      </InfiniteScroll>
    </div>
  );
}

// ============================================
// 核心原理说明
// ============================================

/**
 * 虚拟列表的核心原理：
 * 
 * 1. 问题：
 *    - 当列表有 1000 条数据时，全部渲染会导致性能问题
 *    - DOM 节点过多，滚动卡顿，内存占用高
 * 
 * 2. 解决方案：
 *    - 只渲染可见区域的列表项（比如 10 条）
 *    - 使用一个高度撑开的容器模拟完整列表
 *    - 根据滚动位置动态计算应该渲染哪些项
 * 
 * 3. 关键计算：
 *    - totalHeight = 列表总数 × 单项高度  // 撑开滚动条
 *    - visibleCount = 容器高度 ÷ 单项高度  // 可见数量
 *    - startIndex = 滚动距离 ÷ 单项高度    // 起始索引
 *    - offsetY = startIndex × 单项高度      // 偏移量
 * 
 * 4. 缓冲区（overscan）：
 *    - 上下各多渲染几个 item
 *    - 避免快速滚动时出现白屏
 *    - 平衡性能和体验
 * 
 * 5. 性能优化：
 *    - 使用 transform 代替 top（GPU 加速）
 *    - 使用 useMemo 缓存计算结果
 *    - 使用 will-change 提示浏览器优化
 */

// ============================================
// 注意事项
// ============================================

/**
 * 1. 固定高度 vs 动态高度：
 *    - 当前实现是固定高度（简单、性能好）
 *    - 如果需要动态高度，需要：
 *      a. 预估高度
 *      b. 渲染后测量实际高度
 *      c. 更新高度缓存
 *      d. 重新计算位置
 * 
 * 2. 如何确定 itemHeight：
 *    - 方法 1: 手动测量（开发者工具）
 *    - 方法 2: 代码中动态测量第一个元素
 *    - 方法 3: 设计时统一高度
 * 
 * 3. 与现有代码集成：
 *    - 保留 InfiniteScroll（加载更多）
 *    - 保留 PullToRefresh（下拉刷新）
 *    - 只替换中间的列表渲染部分
 * 
 * 4. 何时使用虚拟列表：
 *    - 列表项数量 > 100
 *    - 单个列表项较复杂（DOM 节点多）
 *    - 用户反馈滚动卡顿
 */

export {
  Example1_BasicUsage,
  Example2_WithInfiniteScroll,
  Example3_HomeIntegration,
};
