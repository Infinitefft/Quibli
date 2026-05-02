import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import PostsItem from '@/components/post/PostsItem';
import useHomePostStore from '@/store/homePost';
import BackToTop from '@/components/BackToTop';
import { HomeVirtuosoList, ESTIMATE_POST_ROW } from '@/components/HomeVirtuosoList';
import { HomeFeedSkeleton } from '@/components/HomeFeedSkeleton';
import type { HomeFeedOutletContext } from '@/pages/home/homeFeedOutletContext';

/** 首页「推荐文章」子路由：首屏骨架 → 有数据后切虚拟列表；滚动与顶栏联动由 Layout context 提供 */
export default function HomePostsPanel() {
  const { pathname } = useLocation();
  // 从 HomeFeedLayout 注入：列表高度、滚动驱动顶栏、切换时同步滚动基准
  const { listViewportHeight, handleScroll, syncScrollOrigin } =
    useOutletContext<HomeFeedOutletContext>();
  const { loadingPosts, loadMorePosts, posts, hasMorePosts, prefetchPosts } = useHomePostStore();
  // 骨架与虚拟列表共用同一个滚动容器 ref，BackToTop 才能始终滚同一个节点
  const scrollRef = useRef<HTMLDivElement>(null);

  // 挂载即拉首屏：仅在 posts 仍为空时触发，避免重复请求（依赖数组故意为空，见 eslint 注释）
  useEffect(() => {
    if (posts.length === 0) loadMorePosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 何时显示骨架：还没有任何帖子，但「正在加载」或「后端可能还有更多」——避免无数据又不加载的死寂态
  const showSkeleton = posts.length === 0 && (loadingPosts || hasMorePosts);

  // 在「路由路径变化」或「骨架/列表切换」后同步 Layout 内记录的 scrollTop，修正顶栏位移状态机
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) syncScrollOrigin(el.scrollTop);
  }, [pathname, showSkeleton, syncScrollOrigin]);

  return (
    <>
      {showSkeleton ? (
        // 分支 A：骨架阶段 —— 自己包一层可滚动 div，高度用 Layout 测得的视口高，onScroll 仍交给 Layout
        <div
          ref={scrollRef}
          className="no-scrollbar transform-gpu w-full min-h-0"
          style={{ height: listViewportHeight, overflowY: 'auto' }}
          onScroll={handleScroll}
        >
          <HomeFeedSkeleton variant="posts" />
        </div>
      ) : (
        // 分支 B：有数据 —— 交给 HomeVirtuosoList：内部同一 scrollRef + 虚拟行 + InfiniteScroll
        <HomeVirtuosoList
          scrollRef={scrollRef}
          items={posts}
          estimateSize={ESTIMATE_POST_ROW}
          height={listViewportHeight}
          onScroll={handleScroll}
          hasMore={hasMorePosts}
          isLoading={loadingPosts}
          onLoadMore={loadMorePosts}
          onPrefetch={prefetchPosts}
          renderItem={(post) => <PostsItem post={post} />}
          scrollClassName="no-scrollbar transform-gpu w-full min-h-0"
        />
      )}
      {/*
        BackToTop：监听 targetRef 的滚动位置显示按钮；key 在骨架/列表切换时变化，强制内部 effect 重新绑定
      */}
      <BackToTop
        key={showSkeleton ? 'posts-sk' : 'posts-list'}
        targetRef={scrollRef as React.RefObject<HTMLDivElement>}
        tabBarHeight={65}
      />
    </>
  );
}
