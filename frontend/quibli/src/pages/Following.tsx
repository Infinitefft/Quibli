import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InfiniteScroll from '@/components/InfiniteScroll';
import { PullToRefresh } from '@/components/PullToRefresh';
import PostsItem from '@/components/post/PostsItem';
import QuestionsItem from '@/components/question/QuestionsItem';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { User, Post, Question } from '@/types'; 
import { getFollowedUsers, getFollowedPosts, getFollowedQuestions } from '@/api/user';
import { useUserStore } from '@/store/user';
import BackToTop from '@/components/BackToTop';

// 缓存对象：保留页面切换后的状态
const cache = {
  followedUsers: [] as User[],
  posts: [] as Post[],
  questions: [] as Question[],
  postsPage: 1,
  questionsPage: 1,
  hasMorePosts: true,
  hasMoreQuestions: true,
  postsScrollY: 0,
  questionsScrollY: 0,
  activeTab: 'posts' as 'posts' | 'questions',
  fetchingPostsPage: 0,
  fetchingQuestionsPage: 0,
  usersFetched: false,
};

export default function Following() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUserStore((state) => state.user);

  // 状态管理
  const [followedUsers, setFollowedUsers] = useState<User[]>(cache.followedUsers);
  const [activeTab, setActiveTab] = useState<'posts' | 'questions'>(cache.activeTab);
  const [posts, setPosts] = useState<Post[]>(cache.posts);
  const [questions, setQuestions] = useState<Question[]>(cache.questions);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const postsContainerRef = useRef<HTMLDivElement>(null);
  const questionsContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // 1. 获取关注的用户列表 (拦截器已处理 res.data)
  const fetchFollowedUsers = useCallback(async () => {
    if (!user?.id || cache.usersFetched) return;
    try {
      // 这里的 res 直接就是后端 return 的对象
      const res = await getFollowedUsers(user.id, 1, 30);
      const users = res.followedUsers || [];
      cache.followedUsers = users;
      setFollowedUsers(users);
      cache.usersFetched = true;
    } catch (error) {
      console.error("获取关注用户列表失败:", error);
    }
  }, [user?.id]);

  // 2. 加载文章
  const loadMorePosts = useCallback(async () => {
    if (loadingPosts || !cache.hasMorePosts || !user?.id || cache.fetchingPostsPage === cache.postsPage) return;

    setLoadingPosts(true);
    cache.fetchingPostsPage = cache.postsPage;

    try {
      const res = await getFollowedPosts(cache.postsPage, 10);
      const newItems: Post[] = res.postItems || [];
      
      const existingIds = new Set(cache.posts.map(item => item.id));
      const uniqueItems = newItems.filter(item => !existingIds.has(item.id));
      
      cache.posts = [...cache.posts, ...uniqueItems];
      cache.hasMorePosts = newItems.length === 10;
      cache.postsPage += 1;
      
      setPosts([...cache.posts]);
    } finally {
      setLoadingPosts(false);
      cache.fetchingPostsPage = 0;
    }
  }, [user?.id, loadingPosts]);

  // 3. 加载问题
  const loadMoreQuestions = useCallback(async () => {
    if (loadingQuestions || !cache.hasMoreQuestions || !user?.id || cache.fetchingQuestionsPage === cache.questionsPage) return;

    setLoadingQuestions(true);
    cache.fetchingQuestionsPage = cache.questionsPage;

    try {
      const res = await getFollowedQuestions(cache.questionsPage, 10);
      const newItems: Question[] = res.questionItems || [];
      
      const existingIds = new Set(cache.questions.map(item => item.id));
      const uniqueItems = newItems.filter(item => !existingIds.has(item.id));
      
      cache.questions = [...cache.questions, ...uniqueItems];
      cache.hasMoreQuestions = newItems.length === 10;
      cache.questionsPage += 1;
      
      setQuestions([...cache.questions]);
    } finally {
      setLoadingQuestions(false);
      cache.fetchingQuestionsPage = 0;
    }
  }, [user?.id, loadingQuestions]);

  // 初始化请求
  useEffect(() => {
    fetchFollowedUsers();
    if (cache.posts.length === 0) loadMorePosts();
    if (cache.questions.length === 0) loadMoreQuestions();
  }, [fetchFollowedUsers, loadMorePosts, loadMoreQuestions]);

  // 刷新逻辑
  const handleRefresh = async () => {
    if (activeTab === 'posts') {
      cache.postsPage = 1;
      cache.hasMorePosts = true;
      cache.posts = [];
      setPosts([]);
      await loadMorePosts();
    } else {
      cache.questionsPage = 1;
      cache.hasMoreQuestions = true;
      cache.questions = [];
      setQuestions([]);
      await loadMoreQuestions();
    }
  };

  // 滚动位置恢复
  useLayoutEffect(() => {
    if (postsContainerRef.current && cache.postsScrollY > 0) postsContainerRef.current.scrollTop = cache.postsScrollY;
    if (questionsContainerRef.current && cache.questionsScrollY > 0) questionsContainerRef.current.scrollTop = cache.questionsScrollY;
  }, []);

  useEffect(() => { cache.activeTab = activeTab; }, [activeTab]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, type: 'posts' | 'questions') => {
    if (type === 'posts') cache.postsScrollY = e.currentTarget.scrollTop;
    else cache.questionsScrollY = e.currentTarget.scrollTop;
  };

  const handleItemClick = (id: number, type: 'posts' | 'questions') => {
    navigate(`/${type === 'posts' ? 'post' : 'question'}/${id}`, { state: { fromUrl: location.pathname } });
  };

  const handleUserClick = (userId: number) => {
    navigate(`/user/${userId}/posts`, { state: { fromUrl: location.pathname } });
  };

  // 手势切换
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.targetTouches[0].clientX; touchEndX.current = null; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50 && activeTab === 'posts') setActiveTab('questions');
    else if (distance < -50 && activeTab === 'questions') setActiveTab('posts');
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-white flex flex-col overflow-hidden">
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      
      <header className="pt-10 z-10 bg-white flex-shrink-0">
        <div className="h-11 px-4 flex items-center justify-center relative">
          <h1 className="text-lg font-bold text-gray-900">关注</h1>
        </div>
      </header>

      {/* 横向关注用户列表 */}
      <div className="pt-3 pb-4 border-b border-gray-100 flex-shrink-0 bg-white">
        <div className="flex overflow-x-auto no-scrollbar space-x-5 px-4">
          {followedUsers.map(u => (
            <div 
              key={u.id} 
              onClick={() => handleUserClick(u.id)} 
              className="flex flex-col items-center flex-shrink-0 w-14 cursor-pointer active:scale-95 transition-transform"
            >
              <Avatar className="w-14 h-14 border-2 border-indigo-50 p-0.5 shadow-sm">
                <AvatarImage src={u.avatar} className="object-cover rounded-full" />
                <AvatarFallback className="bg-indigo-50 text-indigo-500 font-bold text-lg">
                  {u.nickname?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="mt-1.5 text-[10px] text-gray-500 truncate w-full text-center font-medium leading-tight">
                {u.nickname}
              </span>
            </div>
          ))}
          {cache.usersFetched && followedUsers.length === 0 && (
            <div className="w-full text-center text-sm text-gray-400 py-4 italic">暂无关注</div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="h-[48px] flex items-center justify-center relative bg-white border-b border-gray-100 flex-shrink-0">
        <button 
          onClick={() => setActiveTab('posts')} 
          className={`flex-1 h-full flex items-center justify-center text-[15px] font-semibold transition-colors relative ${activeTab === 'posts' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          文章{activeTab === 'posts' && <span className="absolute bottom-0 w-8 h-0.5 bg-indigo-600 rounded-full" />}
        </button>
        <div className="w-[1px] h-3 bg-gray-100" />
        <button 
          onClick={() => setActiveTab('questions')} 
          className={`flex-1 h-full flex items-center justify-center text-[15px] font-semibold transition-colors relative ${activeTab === 'questions' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          问题{activeTab === 'questions' && <span className="absolute bottom-0 w-8 h-0.5 bg-indigo-600 rounded-full" />}
        </button>
      </div>

      <main 
        className="flex-1 relative w-full h-full overflow-hidden bg-slate-50/50" 
        onTouchStart={handleTouchStart} 
        onTouchMove={handleTouchMove} 
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex w-[200vw] h-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" 
          style={{ transform: activeTab === 'posts' ? 'translateX(0)' : 'translateX(-50%)' }}
        >
          {/* 文章动态 */}
          <div 
            ref={postsContainerRef} 
            className="w-screen h-full overflow-y-auto no-scrollbar pb-24" 
            onScroll={(e) => handleScroll(e, 'posts')}
          >
            <PullToRefresh onRefresh={handleRefresh} scrollableElementRef={postsContainerRef}>
              <InfiniteScroll onLoadMore={loadMorePosts} hasMore={cache.hasMorePosts} isLoading={loadingPosts}>
                <div className="pt-2">
                  {posts.map((post) => (
                    <PostsItem key={`post-${post.id}`} post={post} onClick={() => handleItemClick(post.id, 'posts')} />
                  ))}
                  {!loadingPosts && posts.length === 0 && cache.usersFetched && (
                    <div className="py-20 text-center text-sm text-gray-400">暂无关注动态</div>
                  )}
                </div>
              </InfiniteScroll>
            </PullToRefresh>
          </div>
          
          {/* 问题动态 */}
          <div 
            ref={questionsContainerRef} 
            className="w-screen h-full overflow-y-auto no-scrollbar pb-24" 
            onScroll={(e) => handleScroll(e, 'questions')}
          >
            <PullToRefresh onRefresh={handleRefresh} scrollableElementRef={questionsContainerRef}>
              <InfiniteScroll onLoadMore={loadMoreQuestions} hasMore={cache.hasMoreQuestions} isLoading={loadingQuestions}>
                <div className="pt-2">
                  {questions.map((q) => (
                    <QuestionsItem key={`q-${q.id}`} question={q} onClick={() => handleItemClick(q.id, 'questions')} />
                  ))}
                  {!loadingQuestions && questions.length === 0 && cache.usersFetched && (
                    <div className="py-20 text-center text-sm text-gray-400">暂无关注动态</div>
                  )}
                </div>
              </InfiniteScroll>
            </PullToRefresh>
          </div>
        </div>
        <BackToTop 
          targetRef={activeTab === 'posts' ? postsContainerRef : questionsContainerRef} 
          tabBarHeight={65} 
        />
      </main>
    </div>
  );
}