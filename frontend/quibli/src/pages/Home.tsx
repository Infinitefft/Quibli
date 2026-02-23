import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/SearchInput';
import { Search } from 'lucide-react';
import InfiniteScroll from '@/components/InfiniteScroll';
import { PullToRefresh } from '@/components/PullToRefresh';
import { refreshHomePosts, refreshHomeQuestions } from '@/store/homeRefresh';
import PostsItem from '@/components/post/PostsItem';
import useHomePostStore from '@/store/homePost';
import useHomeQuestionStore from '@/store/homeQuestion';
import QuestionsItem from '@/components/question/QuestionsItem';
import { useUserStore } from '@/store/user';

export default function Home() {
  const navigate = useNavigate();
  const { loadingPosts, loadMorePosts, posts, hasMorePosts } = useHomePostStore();
  const { loadingQuestions, loadMoreQuestions, questions, hasMoreQuestions } = useHomeQuestionStore();
  const user = useUserStore((state) => state.user);
  
  const [activeTab, setActiveTab] = useState<'posts' | 'questions'>('posts');

  const headerRef = useRef<HTMLElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const postsContainerRef = useRef<HTMLDivElement>(null);
  const questionsContainerRef = useRef<HTMLDivElement>(null);

  const lastScrollY = useRef(0);
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

  useEffect(() => {
    const container = activeTab === 'posts' ? postsContainerRef.current : questionsContainerRef.current;
    if (container) {
      lastScrollY.current = container.scrollTop;

      if (container.scrollTop < 10) {
        updateHeader(0);
      }
    }
  }, [activeTab]);

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
        <div 
          className="flex w-[200vw] h-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform"
          style={{ transform: activeTab === 'posts' ? 'translateX(0)' : 'translateX(-50%)' }}
        >
          <div 
            ref={postsContainerRef}
            className="w-screen h-full overflow-y-auto no-scrollbar overscroll-y-contain transform-gpu pt-[145px] pb-24"
            onScroll={handleScroll}
          >
            <PullToRefresh onRefresh={handleRefresh} scrollableElementRef={postsContainerRef}>
              <InfiniteScroll
                onLoadMore={loadMorePosts}
                hasMore={hasMorePosts}
                isLoading={loadingPosts}
              >
                <div className="pb-4 bg-gray-50">
                  {posts.map((post, index) => (
                    <PostsItem key={`${post.id}-${index}`} post={post} />
                  ))}
                </div>
              </InfiniteScroll>
            </PullToRefresh>
          </div>

          <div 
            ref={questionsContainerRef}
            className="w-screen h-full overflow-y-auto no-scrollbar overscroll-y-contain transform-gpu pt-[145px] pb-24"
            onScroll={handleScroll}
          >
            <PullToRefresh onRefresh={handleRefresh} scrollableElementRef={questionsContainerRef}>
              <InfiniteScroll
                onLoadMore={loadMoreQuestions}
                hasMore={hasMoreQuestions}
                isLoading={loadingQuestions}
              >
                <div className="pb-4 bg-gray-50">
                  {questions.map((question, index) => (
                    <QuestionsItem key={`${question.id}-${index}`} question={question} />
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