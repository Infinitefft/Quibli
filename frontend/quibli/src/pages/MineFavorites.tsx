import { useEffect, useRef, useLayoutEffect, type UIEvent, type TouchEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import InfiniteScroll from '@/components/InfiniteScroll';
import PostsItem from '@/components/post/PostsItem';
import QuestionsItem from '@/components/question/QuestionsItem';
import { useUserStore } from '@/store/user';
import { useMineStore } from '@/store/mine';

export default function MineFavorites() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = useUserStore((state) => state.user?.id);

  const posts = useMineStore((s) => s.favoritesFeed.posts);
  const questions = useMineStore((s) => s.favoritesFeed.questions);
  const loadingPosts = useMineStore((s) => s.favoritesFeed.loadingPosts);
  const loadingQuestions = useMineStore((s) => s.favoritesFeed.loadingQuestions);
  const hasMorePosts = useMineStore((s) => s.favoritesFeed.hasMorePosts);
  const hasMoreQuestions = useMineStore((s) => s.favoritesFeed.hasMoreQuestions);
  const activeTab = useMineStore((s) => s.favoritesFeed.activeTab);
  const postsScrollY = useMineStore((s) => s.favoritesFeed.postsScrollY);
  const questionsScrollY = useMineStore((s) => s.favoritesFeed.questionsScrollY);

  const setActiveTab = useMineStore((s) => s.setFavoritesActiveTab);
  const setPostsScrollY = useMineStore((s) => s.setFavoritesPostsScrollY);
  const setQuestionsScrollY = useMineStore((s) => s.setFavoritesQuestionsScrollY);
  const loadMorePosts = useMineStore((s) => s.loadMoreFavoritesPosts);
  const loadMoreQuestions = useMineStore((s) => s.loadMoreFavoritesQuestions);
  const ensureInitialFetch = useMineStore((s) => s.ensureFavoritesInitialFetch);

  const postsContainerRef = useRef<HTMLDivElement>(null);
  const questionsContainerRef = useRef<HTMLDivElement>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (postsContainerRef.current && postsScrollY > 0) {
      postsContainerRef.current.scrollTop = postsScrollY;
    }
    if (questionsContainerRef.current && questionsScrollY > 0) {
      questionsContainerRef.current.scrollTop = questionsScrollY;
    }
  }, [posts, questions, postsScrollY, questionsScrollY]);

  useEffect(() => {
    if (userId) ensureInitialFetch(userId);
  }, [userId, ensureInitialFetch]);

  const handleScroll = (e: UIEvent<HTMLDivElement>, type: 'posts' | 'questions') => {
    const scrollTop = e.currentTarget.scrollTop;
    if (type === 'posts') setPostsScrollY(scrollTop);
    else setQuestionsScrollY(scrollTop);
  };

  const handleItemClick = (id: number | string, type: 'posts' | 'questions') => {
    navigate(`/${type}/${id}`, {
      state: { fromUrl: location.pathname + location.search },
    });
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: TouchEvent) => {
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
          <h1 className="text-[17px] font-medium absolute left-1/2 -translate-x-1/2 text-gray-900">我的收藏</h1>
        </div>

        <div className="h-[48px] flex items-center justify-center relative bg-white border-b border-gray-100">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 h-full flex items-center justify-center text-[15px] font-medium transition-colors relative ${activeTab === 'posts' ? 'text-blue-600' : 'text-gray-500'}`}
          >
            收藏的文章
            {activeTab === 'posts' && <span className="absolute bottom-0 w-6 h-1 bg-blue-600 rounded-t-full" />}
          </button>
          <div className="w-[1px] h-3 bg-gray-200" />
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 h-full flex items-center justify-center text-[15px] font-medium transition-colors relative ${activeTab === 'questions' ? 'text-blue-600' : 'text-gray-500'}`}
          >
            收藏的问题
            {activeTab === 'questions' && <span className="absolute bottom-0 w-6 h-1 bg-blue-600 rounded-t-full" />}
          </button>
        </div>
      </header>

      <main className="flex-1 relative w-full h-full overflow-hidden" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <div className="flex w-[200vw] h-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" style={{ transform: activeTab === 'posts' ? 'translateX(0)' : 'translateX(-50%)' }}>
          <div ref={postsContainerRef} className="w-screen h-full overflow-y-auto no-scrollbar pb-24" onScroll={(e) => handleScroll(e, 'posts')}>
            <InfiniteScroll
              onLoadMore={() => userId && loadMorePosts(userId)}
              hasMore={hasMorePosts}
              isLoading={loadingPosts}
            >
              <div className="pb-4 bg-gray-50">
                {posts.map((post, index) => (
                  <PostsItem key={`${post.id}-${index}`} post={post} onClick={() => handleItemClick(post.id, 'posts')} />
                ))}
              </div>
            </InfiniteScroll>
          </div>

          <div ref={questionsContainerRef} className="w-screen h-full overflow-y-auto no-scrollbar pb-24" onScroll={(e) => handleScroll(e, 'questions')}>
            <InfiniteScroll
              onLoadMore={() => userId && loadMoreQuestions(userId)}
              hasMore={hasMoreQuestions}
              isLoading={loadingQuestions}
            >
              <div className="pb-4 bg-gray-50">
                {questions.map((question, index) => (
                  <QuestionsItem key={`${question.id}-${index}`} question={question} onClick={() => handleItemClick(question.id, 'questions')} />
                ))}
              </div>
            </InfiniteScroll>
          </div>
        </div>
      </main>
    </div>
  );
}
