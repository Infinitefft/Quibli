import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/SearchInput';
import { Search } from 'lucide-react';
import { PullToRefresh } from '@/components/PullToRefresh';
import { refreshHomePosts, refreshHomeQuestions } from '@/store/homeRefresh';
import PostsItem from '@/components/post/PostsItem';
import useHomePostStore from '@/store/homePost';
import useHomeQuestionStore from '@/store/homeQuestion';
import QuestionsItem from '@/components/question/QuestionsItem';
import { useUserStore } from '@/store/user';
import BackToTop from '@/components/BackToTop';
import {
  HomeTanStackList,
  ESTIMATE_POST_ROW,
  ESTIMATE_QUESTION_ROW,
} from '@/components/HomeTanStackList';
import { HomeFeedSkeleton } from '@/components/HomeFeedSkeleton';

/**
 * 首页布局要点（读代码时按这个顺序理解）：
 *
 * 1) 顶栏 fixed，正文区域用 pt-[145px] 把列表顶到搜索栏/Tab 下方，避免被遮挡。
 *
 * 2) 文章 / 问答两栏并排（总宽 200vw），通过外层 translateX 切换「显示哪一栏」，两栏 DOM 都挂载，
 *    各自一套滚动与数据，切换 Tab 不会丢另一栏的 scrollTop。
 *
 * 3) 列表区域：PullToRefresh 需要「谁在滚动」的 DOM → scrollableElementRef 指向各栏的滚动容器；
 *    HomeTanStackList 把同一 ref 挂在 overflow 的 div 上，内部再用 TanStack 做虚拟化。
 *
 * 4) listViewportHeight：虚拟列表必须知道「视口高度」才能算一屏能摆几行，用 ResizeObserver 量 flex 分配后的高度。
 *
 * 5) handleScroll + updateHeader：与虚拟列表无关，是给顶栏随列表上滑收起/搜索条渐隐用的（增量算 translate）。
 */
export default function Home() {
  const navigate = useNavigate();
  const { loadingPosts, loadMorePosts, posts, hasMorePosts } = useHomePostStore();
  const { loadingQuestions, loadMoreQuestions, questions, hasMoreQuestions } = useHomeQuestionStore();
  const user = useUserStore((state) => state.user);
  
  const [activeTab, setActiveTab] = useState<'posts' | 'questions'>('posts');

  const headerRef = useRef<HTMLElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  /** 文章列表滚动容器：overflow 在此 div 上，供虚拟列表、下拉刷新、回顶、handleScroll 共用 */
  const postsContainerRef = useRef<HTMLDivElement>(null);
  /** 问答列表滚动容器，职责同上 */
  const questionsContainerRef = useRef<HTMLDivElement>(null);
  /** 仅用于量高度：内层 flex-1 分配到的「列表可视区」像素高，传给 HomeTanStackList 的 height */
  const listViewportRef = useRef<HTMLDivElement>(null);
  const [listViewportHeight, setListViewportHeight] = useState(() =>
    typeof window !== 'undefined' ? Math.max(200, window.innerHeight - 145 - 96) : 400
  );

  /** 上一次 scrollTop，用于算本次滚动的 delta，驱动顶栏位移 */
  const lastScrollY = useRef(0);
  /** 顶栏当前 translateY（负值表示上移隐藏搜索条区域） */
  const currentTranslateY = useRef(0);

  const updateHeader = (translate: number) => {
    currentTranslateY.current = translate;
    
    if (headerRef.current) {
      headerRef.current.style.transform = `translate3d(0, ${translate}px, 0)`;
    }
    
    if (searchBarRef.current) {
      const opacity = Math.max(0, 1 - (Math.abs(translate) / 40));
      searchBarRef.current.style.opacity = opacity.toString();
      searchBarRef.current.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';
    }
  };

  // 切换 Tab 时：把「当前栏滚动位置」同步到 lastScrollY，避免顶栏位移从上一次另一栏的值跳变
  useEffect(() => {
    const container = activeTab === 'posts' ? postsContainerRef.current : questionsContainerRef.current;
    if (container) {
      lastScrollY.current = container.scrollTop;

      if (container.scrollTop < 10) {
        updateHeader(0);
      }
    }
  }, [activeTab]);

  // 首屏及窗口尺寸变化时更新列表可视高度；虚拟列表依赖稳定的 height 才能正确计算可见行数
  useLayoutEffect(() => {
    const el = listViewportRef.current;
    if (!el) return;
    const update = () => setListViewportHeight(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 两栏共用同一套逻辑：根据滚动增量更新顶栏（与 TanStack 内部如何切片 DOM 无关）
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    
    if (scrollTop < 0) return;

    const deltaY = scrollTop - lastScrollY.current;
    lastScrollY.current = scrollTop;

    let newTranslate = currentTranslateY.current - deltaY;

    newTranslate = Math.max(-57, Math.min(0, newTranslate));

    if (scrollTop <= 0) {
      newTranslate = 0;
    }

    if (newTranslate !== currentTranslateY.current) {
      updateHeader(newTranslate);
    }
  };

  useEffect(() => {
    if (posts.length === 0) loadMorePosts();
    if (questions.length === 0) loadMoreQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      if (activeTab === 'posts') setActiveTab('questions');
    } else if (distance < -minSwipeDistance) {
      if (activeTab === 'questions') setActiveTab('posts');
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleRefresh = async () => {
    if (activeTab === 'posts') {
      await refreshHomePosts();
    } else {
      await refreshHomeQuestions();
    }
  };

  /** 首屏尚无数据：用骨架屏占位（loading 或与 store 默认 hasMore 组合，避免首帧空白） */
  const showPostsSkeleton =
    posts.length === 0 && (loadingPosts || hasMorePosts);
  const showQuestionsSkeleton =
    questions.length === 0 && (loadingQuestions || hasMoreQuestions);

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-50 flex flex-col overflow-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <header 
        ref={headerRef}
        // 1. 去掉 bg-white/95 和 backdrop-blur-md，改为不透明的 bg-white
        // 2. 这样文字滑到下面时会被完全遮挡，不再有闪烁感
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] pt-10 will-change-transform"
      >
        <div 
          ref={searchBarRef}
          className="h-[57px] px-4 py-3 flex items-center space-x-3 border-b border-gray-100/50 box-border"
        >
          <div className="flex-1">
            <Input 
              placeholder="搜索你感兴趣的内容..."
              icon={<Search className="w-4 h-4 text-gray-400" />}
              className="bg-gray-100/80 border-transparent focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-100 h-9 text-sm"
              onClick={() => navigate('/searchsuggestions')}
            />
          </div>
          
          <button 
            className="group relative flex-shrink-0 active:scale-95 transition-transform duration-200 ml-1"
            onClick={() => navigate('/mine')}
          >
            <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 p-0.5 shadow-sm overflow-hidden flex items-center justify-center">
                {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.nickname || 'User'} 
                      className="w-full h-full rounded-full object-cover bg-white"
                    />
                ) : (
                    <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {user?.nickname?.[0]?.toUpperCase() || 'G'}
                    </div>
                )}
            </div>
          </button>
        </div>

        <div className="h-[48px] flex items-center justify-center relative bg-white box-border border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`flex-1 h-full flex items-center justify-center text-[15px] font-medium transition-colors relative ${
              activeTab === 'posts' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            推荐文章
            {activeTab === 'posts' && (
              <span className="absolute bottom-0 w-6 h-1 bg-blue-600 rounded-t-full transition-all duration-300 ease-out" />
            )}
          </button>
          
          <div className="w-[1px] h-3 bg-gray-200" />
          
          <button 
            onClick={() => setActiveTab('questions')}
            className={`flex-1 h-full flex items-center justify-center text-[15px] font-medium transition-colors relative ${
              activeTab === 'questions' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            热门问答
            {activeTab === 'questions' && (
              <span className="absolute bottom-0 w-6 h-1 bg-blue-600 rounded-t-full transition-all duration-300 ease-out" />
            )}
          </button>
        </div>
      </header>

      <main 
        className="flex-1 relative w-full h-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 双栏「轮播」：两栏各一屏宽，整体左移半屏即切换到问答 */}
        <div 
          className="flex w-[200vw] h-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform"
          style={{ transform: activeTab === 'posts' ? 'translateX(0)' : 'translateX(-50%)' }}
        >
          {/* ——— 文章栏 ——— */}
          <div className="w-screen h-full flex flex-col min-h-0 pt-[145px] pb-24 box-border">
            <div ref={listViewportRef} className="flex-1 min-h-0 flex flex-col">
              <PullToRefresh
                onRefresh={handleRefresh}
                scrollableElementRef={postsContainerRef as React.RefObject<HTMLElement>}
              >
                {showPostsSkeleton ? (
                  <div
                    ref={postsContainerRef}
                    className="no-scrollbar overscroll-y-contain transform-gpu w-full min-h-0"
                    style={{ height: listViewportHeight, overflowY: 'auto' }}
                    onScroll={handleScroll}
                  >
                    <HomeFeedSkeleton variant="posts" />
                  </div>
                ) : (
                  <HomeTanStackList
                    scrollRef={postsContainerRef}
                    items={posts}
                    estimateSize={ESTIMATE_POST_ROW}
                    height={listViewportHeight}
                    onScroll={handleScroll}
                    hasMore={hasMorePosts}
                    isLoading={loadingPosts}
                    onLoadMore={loadMorePosts}
                    renderItem={(post) => <PostsItem post={post} />}
                    scrollClassName="no-scrollbar overscroll-y-contain transform-gpu w-full min-h-0"
                  />
                )}
              </PullToRefresh>
            </div>
          </div>

          {/* ——— 问答栏（结构与文章栏对称） ——— */}
          <div className="w-screen h-full flex flex-col min-h-0 pt-[145px] pb-24 box-border">
            <div className="flex-1 min-h-0 flex flex-col">
              <PullToRefresh
                onRefresh={handleRefresh}
                scrollableElementRef={questionsContainerRef as React.RefObject<HTMLElement>}
              >
                {showQuestionsSkeleton ? (
                  <div
                    ref={questionsContainerRef}
                    className="no-scrollbar overscroll-y-contain transform-gpu w-full min-h-0"
                    style={{ height: listViewportHeight, overflowY: 'auto' }}
                    onScroll={handleScroll}
                  >
                    <HomeFeedSkeleton variant="questions" />
                  </div>
                ) : (
                  <HomeTanStackList
                    scrollRef={questionsContainerRef}
                    items={questions}
                    estimateSize={ESTIMATE_QUESTION_ROW}
                    height={listViewportHeight}
                    onScroll={handleScroll}
                    hasMore={hasMoreQuestions}
                    isLoading={loadingQuestions}
                    onLoadMore={loadMoreQuestions}
                    renderItem={(q) => <QuestionsItem question={q} />}
                    scrollClassName="no-scrollbar overscroll-y-contain transform-gpu w-full min-h-0"
                  />
                )}
              </PullToRefresh>
            </div>
          </div>
        </div>
        <BackToTop
          targetRef={
            (activeTab === 'posts' ? postsContainerRef : questionsContainerRef) as React.RefObject<HTMLDivElement>
          }
          tabBarHeight={65}
        />
      </main>
    </div>
  );
}