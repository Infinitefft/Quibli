import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/SearchInput';
import { Search } from 'lucide-react';
import InfiniteScroll from '@/components/InfiniteScroll';
import { PullToRefresh } from '@/components/PullToRefresh';
import { refreshHomePosts, refreshHomeQuestions } from '@/store/homeRefresh';

import PostsItem from '@/pages/PostsItem';
import useHomePostStore from '@/store/homePost';

import useHomeQuestionStore from '@/store/homeQuestion';
import QuestionsItem from '@/pages/QuestionsItem';
import { useUserStore } from '@/store/user';

export default function Home() {
  const navigate = useNavigate();
  const { loadingPosts, loadMorePosts, posts, hasMorePosts } = useHomePostStore();
  const { loadingQuestions, loadMoreQuestions, questions, hasMoreQuestions } = useHomeQuestionStore();
  const user = useUserStore((state) => state.user);
  
  const [activeTab, setActiveTab] = useState<'posts' | 'questions'>('posts');

  // Animation Refs
  const headerRef = useRef<HTMLElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const postsContainerRef = useRef<HTMLDivElement>(null);
  const questionsContainerRef = useRef<HTMLDivElement>(null);

  // State trackers for animation (using refs to avoid re-renders during scroll)
  const lastScrollY = useRef(0);
  const currentTranslateY = useRef(0);

  // Helper to update DOM directly
  const updateHeader = (translate: number) => {
    currentTranslateY.current = translate;
    
    if (headerRef.current) {
      // Use translate3d for hardware acceleration
      headerRef.current.style.transform = `translate3d(0, ${translate}px, 0)`;
    }
    
    if (searchBarRef.current) {
      // Fade out the search bar. 
      // Fully visible at 0px, fully transparent at -40px (accelerated fade)
      const opacity = Math.max(0, 1 - (Math.abs(translate) / 40));
      searchBarRef.current.style.opacity = opacity.toString();
      // Disable pointer events when invisible to prevent phantom clicks
      searchBarRef.current.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';
    }
  };

  // Sync scroll state when switching tabs
  useEffect(() => {
    const container = activeTab === 'posts' ? postsContainerRef.current : questionsContainerRef.current;
    if (container) {
      // Reset lastScrollY to the current container's position to avoid jump
      lastScrollY.current = container.scrollTop;

      // If the new tab is at the top, force show the header
      // Otherwise, keep the current header state (or we could force hide if deep down)
      if (container.scrollTop < 10) {
        updateHeader(0);
      }
    }
  }, [activeTab]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    
    // Ignore negative scroll (iOS rubber banding)
    if (scrollTop < 0) return;

    const deltaY = scrollTop - lastScrollY.current;
    lastScrollY.current = scrollTop;

    // Calculate new translation based on delta
    // Scroll Down (delta > 0) -> Subtract delta (Move towards -57)
    // Scroll Up (delta < 0) -> Subtract delta (Move towards 0)
    let newTranslate = currentTranslateY.current - deltaY;

    // Clamp between -57 (hidden height) and 0 (fully visible)
    newTranslate = Math.max(-57, Math.min(0, newTranslate));

    // Safety: If at the very top, always show fully
    if (scrollTop <= 0) {
      newTranslate = 0;
    }

    // Apply update only if value changed
    if (newTranslate !== currentTranslateY.current) {
      updateHeader(newTranslate);
    }
  };

  // Initial Data Load
  useEffect(() => {
    if (posts.length === 0) loadMorePosts();
    if (questions.length === 0) loadMoreQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swipe handling
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

  // 新增：下拉刷新处理函数
  const handleRefresh = async () => {
    if (activeTab === 'posts') {
      await refreshHomePosts();
    } else {
      await refreshHomeQuestions();
    }
  };

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
      
      {/* 
        Header Container 
        - Removed CSS transition classes (duration-500, ease-in-out) to allow direct JS control without lag
        - Retained will-change-transform for browser optimization
      */}
      <header 
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.03)] will-change-transform"
      >
        {/* Part 1: Search Bar Row (Height 57px) */}
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
          
          {/* User Avatar Section */}
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

        {/* Part 2: Tab Bar Row (Height 48px) */}
        <div className="h-[48px] flex items-center justify-center relative bg-white/0 box-border border-b border-gray-100">
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

      {/* Main Content Area */}
      <main 
        className="flex-1 relative w-full h-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex w-[200vw] h-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform"
          style={{ transform: activeTab === 'posts' ? 'translateX(0)' : 'translateX(-50%)' }}
        >
          {/* Posts List */}
          <div 
            ref={postsContainerRef}
            className="w-screen h-full overflow-y-auto no-scrollbar overscroll-y-contain transform-gpu pt-[105px] pb-24"
            onScroll={handleScroll}
          >
            <PullToRefresh onRefresh={handleRefresh} scrollableElementRef={postsContainerRef}>
              <InfiniteScroll
                onLoadMore={loadMorePosts}
                hasMore={hasMorePosts}
                isLoading={loadingPosts}
              >
                <div className="pb-4 bg-gray-50">
                  {posts.map((post) => (
                    <PostsItem key={post.id} post={post} />
                  ))}
                </div>
              </InfiniteScroll>
            </PullToRefresh>
          </div>

          {/* Questions List */}
          <div 
            ref={questionsContainerRef}
            className="w-screen h-full overflow-y-auto no-scrollbar overscroll-y-contain transform-gpu pt-[105px] pb-24"
            onScroll={handleScroll}
          >
            <PullToRefresh onRefresh={handleRefresh} scrollableElementRef={questionsContainerRef}>
              <InfiniteScroll
                onLoadMore={loadMoreQuestions}
                hasMore={hasMoreQuestions}
                isLoading={loadingQuestions}
              >
                <div className="pb-4 bg-gray-50">
                  {questions.map((question) => (
                    <QuestionsItem key={question.id} question={question} />
                  ))}
                </div>
              </InfiniteScroll>
            </PullToRefresh>
          </div>
        </div>
      </main>
    </div>
  );
}