import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import InfiniteScroll from '@/components/InfiniteScroll';
import { PullToRefresh } from '@/components/PullToRefresh';
import PostsItem from '@/components/post/PostsItem';
import QuestionsItem from '@/components/question/QuestionsItem';
import { useUserStore } from '@/store/user';
import { getLikePosts, getLikeQuestions } from '@/api/user';

const cache = {
  posts: [] as any[],
  questions: [] as any[],
  postsPage: 1,
  questionsPage: 1,
  hasMorePosts: true,
  hasMoreQuestions: true,
  postsScrollY: 0,
  questionsScrollY: 0,
  activeTab: 'posts' as 'posts' | 'questions',
  fetchingPostsPage: 0,
  fetchingQuestionsPage: 0
};

export default function MineLikes() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUserStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<'posts' | 'questions'>(cache.activeTab);
  const [posts, setPosts] = useState(cache.posts);
  const [questions, setQuestions] = useState(cache.questions);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const postsContainerRef = useRef<HTMLDivElement>(null);
  const questionsContainerRef = useRef<HTMLDivElement>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const loadMorePosts = async () => {
    if (loadingPosts || !cache.hasMorePosts || !user?.id || cache.fetchingPostsPage === cache.postsPage) return;
    
    setLoadingPosts(true);
    cache.fetchingPostsPage = cache.postsPage;
    
    try {
      const res = await getLikePosts(user.id, cache.postsPage, 10);
      const newItems = res.postItems || [];
      const total = res.total || 0;

      const uniqueItems = newItems.filter(
        (newItem: any) => !cache.posts.some((oldItem) => oldItem.id === newItem.id)
      );

      cache.posts = [...cache.posts, ...uniqueItems];
      cache.hasMorePosts = cache.posts.length < total;
      cache.postsPage += 1;
      setPosts([...cache.posts]);
    } finally {
      setLoadingPosts(false);
      cache.fetchingPostsPage = 0;
    }
  };

  const loadMoreQuestions = async () => {
    if (loadingQuestions || !cache.hasMoreQuestions || !user?.id || cache.fetchingQuestionsPage === cache.questionsPage) return;
    
    setLoadingQuestions(true);
    cache.fetchingQuestionsPage = cache.questionsPage;
    
    try {
      const res = await getLikeQuestions(user.id, cache.questionsPage, 10);
      const newItems = res.questionItems || [];
      const total = res.total || 0;

      const uniqueItems = newItems.filter(
        (newItem: any) => !cache.questions.some((oldItem) => oldItem.id === newItem.id)
      );

      cache.questions = [...cache.questions, ...uniqueItems];
      cache.hasMoreQuestions = cache.questions.length < total;
      cache.questionsPage += 1;
      setQuestions([...cache.questions]);
    } finally {
      setLoadingQuestions(false);
      cache.fetchingQuestionsPage = 0;
    }
  };

  const handleRefresh = async () => {
    if (activeTab === 'posts') {
      cache.postsPage = 1;
      cache.hasMorePosts = true;
      cache.posts = [];
      cache.fetchingPostsPage = 0;
      setPosts([]);
      await loadMorePosts();
    } else {
      cache.questionsPage = 1;
      cache.hasMoreQuestions = true;
      cache.questions = [];
      cache.fetchingQuestionsPage = 0;
      setQuestions([]);
      await loadMoreQuestions();
    }
  };

  useLayoutEffect(() => {
    if (postsContainerRef.current && cache.postsScrollY > 0) {
      postsContainerRef.current.scrollTop = cache.postsScrollY;
    }
    if (questionsContainerRef.current && cache.questionsScrollY > 0) {
      questionsContainerRef.current.scrollTop = cache.questionsScrollY;
    }
  }, [posts, questions]);

  useEffect(() => {
    cache.activeTab = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (cache.posts.length === 0) loadMorePosts();
    if (cache.questions.length === 0) loadMoreQuestions();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, type: 'posts' | 'questions') => {
    const scrollTop = e.currentTarget.scrollTop;
    if (type === 'posts') cache.postsScrollY = scrollTop;
    else cache.questionsScrollY = scrollTop;
  };

  const handleItemClick = (id: number | string, type: 'posts' | 'questions') => {
    navigate(`/${type}/${id}`, { 
      state: { fromUrl: location.pathname + location.search } 
    });
  };

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
    if (distance > 50 && activeTab === 'posts') setActiveTab('questions');
    else if (distance < -50 && activeTab === 'questions') setActiveTab('posts');
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-50 flex flex-col overflow-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <header className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] pt-10 z-50">
        <div className="h-11 px-4 flex items-center relative border-b border-gray-100/50 box-border bg-white">
          <button onClick={() => navigate('/mine')} className="p-2 -ml-2 active:scale-95 transition-transform z-10">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-[17px] font-medium absolute left-1/2 -translate-x-1/2 text-gray-900">我的点赞</h1>
        </div>

        <div className="h-[48px] flex items-center justify-center relative bg-white border-b border-gray-100">
          <button onClick={() => setActiveTab('posts')} className={`flex-1 h-full flex items-center justify-center text-[15px] font-medium transition-colors relative ${activeTab === 'posts' ? 'text-blue-600' : 'text-gray-500'}`}>
            赞过的文章
            {activeTab === 'posts' && <span className="absolute bottom-0 w-6 h-1 bg-blue-600 rounded-t-full" />}
          </button>
          <div className="w-[1px] h-3 bg-gray-200" />
          <button onClick={() => setActiveTab('questions')} className={`flex-1 h-full flex items-center justify-center text-[15px] font-medium transition-colors relative ${activeTab === 'questions' ? 'text-blue-600' : 'text-gray-500'}`}>
            赞过的问题
            {activeTab === 'questions' && <span className="absolute bottom-0 w-6 h-1 bg-blue-600 rounded-t-full" />}
          </button>
        </div>
      </header>

      <main className="flex-1 relative w-full h-full overflow-hidden" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <div className="flex w-[200vw] h-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" style={{ transform: activeTab === 'posts' ? 'translateX(0)' : 'translateX(-50%)' }}>
          
          <div ref={postsContainerRef} className="w-screen h-full overflow-y-auto no-scrollbar pb-24" onScroll={(e) => handleScroll(e, 'posts')}>
            <PullToRefresh onRefresh={handleRefresh} scrollableElementRef={postsContainerRef}>
              <InfiniteScroll onLoadMore={loadMorePosts} hasMore={cache.hasMorePosts} isLoading={loadingPosts}>
                <div className="pb-4 bg-gray-50">
                  {posts.map((post, index) => (
                    <PostsItem key={`${post.id}-${index}`} post={post} onClick={() => handleItemClick(post.id, 'posts')} />
                  ))}
                </div>
              </InfiniteScroll>
            </PullToRefresh>
          </div>

          <div ref={questionsContainerRef} className="w-screen h-full overflow-y-auto no-scrollbar pb-24" onScroll={(e) => handleScroll(e, 'questions')}>
            <PullToRefresh onRefresh={handleRefresh} scrollableElementRef={questionsContainerRef}>
              <InfiniteScroll onLoadMore={loadMoreQuestions} hasMore={cache.hasMoreQuestions} isLoading={loadingQuestions}>
                <div className="pb-4 bg-gray-50">
                  {questions.map((question, index) => (
                    <QuestionsItem key={`${question.id}-${index}`} question={question} onClick={() => handleItemClick(question.id, 'questions')} />
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