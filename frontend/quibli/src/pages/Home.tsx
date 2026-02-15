import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/SearchInput';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { Search, Bell } from 'lucide-react';
import InfiniteScroll from '@/components/InfiniteScroll';

import PostsItem from '@/pages/PostsItem';
import useHomePostStore from '@/store/homePost';

import useHomeQuestionStore from '@/store/homeQuestion';
import QuestionsItem from '@/pages/QuestionsItem';

export default function Home() {
  const { scrollDirection, isAtTop, handleScroll } = useScrollDirection();
  // Using the hook logic provided: Hide when scrolling down AND not at top
  const isHidden = scrollDirection === 'down' && !isAtTop;

  const { loadingPosts, loadMorePosts, posts, hasMorePosts } = useHomePostStore();
  const { loadingQuestions, loadMoreQuestions, questions, hasMoreQuestions } = useHomeQuestionStore();
  
  // Tab State: 'posts' | 'questions'
  const [activeTab, setActiveTab] = useState<'posts' | 'questions'>('posts');

  // Swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null; // Reset
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swipe Left -> Go to Questions (if not already there)
      if (activeTab === 'posts') setActiveTab('questions');
    } else if (distance < -minSwipeDistance) {
      // Swipe Right -> Go to Posts (if not already there)
      if (activeTab === 'questions') setActiveTab('posts');
    }
    
    // Cleanup
    touchStartX.current = null;
    touchEndX.current = null;
  };

  useEffect(() => {
    // Initial load
    if (posts.length === 0) loadMorePosts();
    if (questions.length === 0) loadMoreQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col overflow-hidden">
      
      {/* 
        头部容器 (Header Container)
      */}
      <header 
        className={`
          fixed top-0 left-0 right-0 z-50
          bg-white shadow-sm
          transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isHidden ? '-translate-y-full' : 'translate-y-0'}
        `}
      >
        {/* Part 1: Search Bar Row */}
        <div className="px-4 py-2 flex items-center space-x-3 border-b border-gray-50">
          <div className="flex-1">
            <Input 
              placeholder="搜索你感兴趣的内容..."
              icon={<Search className="w-4 h-4" />}
              className="bg-gray-100 border-transparent focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-100 h-9"
            />
          </div>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>

        {/* Part 2: Tab Bar Row */}
        <div className="flex items-center justify-center relative bg-white">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'posts' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            推荐文章
            {activeTab === 'posts' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full transition-all" />
            )}
          </button>
          
          <div className="w-[1px] h-4 bg-gray-200" /> {/* Vertical divider */}
          
          <button 
            onClick={() => setActiveTab('questions')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'questions' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            热门问答
            {activeTab === 'questions' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full transition-all" />
            )}
          </button>
        </div>
      </header>

      {/* 
        Main Content Area 
      */}
      <main 
        className="flex-1 relative w-full h-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slider Container */}
        <div 
          className="flex w-[200vw] h-full transition-transform duration-300 ease-out will-change-transform"
          style={{ transform: activeTab === 'posts' ? 'translateX(0)' : 'translateX(-50%)' }}
        >
          {/* Posts List Section - Width 100vw */}
          <div 
            className="w-screen h-full overflow-y-auto no-scrollbar pt-[100px] pb-10 overscroll-contain"
            onScroll={handleScroll}
          >
            <InfiniteScroll
              onLoadMore={loadMorePosts}
              hasMore={hasMorePosts}
              isLoading={loadingPosts}
            >
              <div>
                {posts.map((post) => (
                  <PostsItem key={post.id} post={post} />
                ))}
              </div>
            </InfiniteScroll>
          </div>

          {/* Questions List Section - Width 100vw */}
          <div 
            className="w-screen h-full overflow-y-auto no-scrollbar pt-[100px] pb-10 overscroll-contain"
            onScroll={handleScroll}
          >
            <InfiniteScroll
              onLoadMore={loadMoreQuestions}
              hasMore={hasMoreQuestions}
              isLoading={loadingQuestions}
            >
              <div>
                {questions.map((question) => (
                  <QuestionsItem key={question.id} question={question} />
                ))}
              </div>
            </InfiniteScroll>
          </div>
        </div>
      </main>
    </div>
  );
}