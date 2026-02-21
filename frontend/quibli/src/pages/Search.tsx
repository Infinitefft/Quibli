import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/SearchInput';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import InfiniteScroll from '@/components/InfiniteScroll';
import { Button } from '@/components/ui/button';
import PostsItem from '@/pages/PostsItem';
import QuestionsItem from '@/pages/QuestionsItem';
import { SearchPostAndQuestion } from '@/api/search';

interface SearchState {
  list: any[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  initialized: boolean;
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';

  const [activeTab, setActiveTab] = useState<'posts' | 'questions'>('posts');
  
  const [postState, setPostState] = useState<SearchState>({ 
    list: [], page: 1, hasMore: true, loading: false, initialized: false 
  });
  const [questionState, setQuestionState] = useState<SearchState>({ 
    list: [], page: 1, hasMore: true, loading: false, initialized: false 
  });

  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const currentTranslateY = useRef(0);
  const lastKeywordRef = useRef(keyword);

  const loadData = async (type: 'posts' | 'questions', isInitial = false) => {
    const state = type === 'posts' ? postState : questionState;
    const setState = type === 'posts' ? setPostState : setQuestionState;
    const apiType = type === 'posts' ? 'post' : 'question';

    if (state.loading) return;
    if (!isInitial && !state.hasMore) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const currentPage = isInitial ? 1 : state.page;
      const res: any = await SearchPostAndQuestion(keyword, apiType, currentPage);
      
      const items = type === 'posts' ? (res.postItems || []) : (res.questionItems || []);

      setState(prev => {
        const rawList = isInitial ? items : [...prev.list, ...items];
        const uniqueList = Array.from(new Map(rawList.map((item: any) => [item.id, item])).values());
        
        return {
          list: uniqueList,
          page: (isInitial ? 1 : prev.page) + 1,
          hasMore: items.length === 10,
          loading: false,
          initialized: true
        };
      });
    } catch (error) {
      console.error(`${type} 加载失败`, error);
      setState(prev => ({ ...prev, loading: false, initialized: true }));
    }
  };

  useEffect(() => {
    if (keyword && keyword !== lastKeywordRef.current) {
      lastKeywordRef.current = keyword;
      const reset = { list: [], page: 1, hasMore: true, loading: false, initialized: false };
      setPostState(reset);
      setQuestionState(reset);
      loadData(activeTab, true);
    }
  }, [keyword]);

  useEffect(() => {
    const currentState = activeTab === 'posts' ? postState : questionState;
    if (keyword && !currentState.initialized && !currentState.loading) {
      loadData(activeTab, true);
    }
  }, [activeTab, keyword]);

  const handleItemClick = (type: 'posts' | 'questions', id: number | string) => {
    if (!id) return;
    navigate(`/${type}/${id}`);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop < 0) return;
    const deltaY = scrollTop - lastScrollY.current;
    lastScrollY.current = scrollTop;
    const newTranslate = Math.max(-57, Math.min(0, currentTranslateY.current - deltaY));
    if (headerRef.current) headerRef.current.style.transform = `translate3d(0, ${newTranslate}px, 0)`;
    currentTranslateY.current = newTranslate;
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-50 flex flex-col overflow-hidden">
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm transition-transform duration-200 will-change-transform">
        <div className="h-[57px] px-2 py-3 flex items-center space-x-2 border-b">
          <Button size="icon" variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div className="flex-1">
            <Input 
              value={keyword}
              readOnly
              icon={<SearchIcon className="w-4 h-4 text-gray-400" />}
              className="bg-gray-100/80 h-9 text-sm rounded-full cursor-pointer"
              onClick={() => navigate('/searchsuggestions')}
            />
          </div>
        </div>

        <div className="h-[48px] flex items-center justify-center bg-white border-b">
          <button onClick={() => setActiveTab('posts')} className={`flex-1 h-full text-[15px] font-medium relative ${activeTab === 'posts' ? 'text-blue-600' : 'text-gray-500'}`}>
            文章内容
            {activeTab === 'posts' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-blue-600 rounded-t-full" />}
          </button>
          <div className="w-[1px] h-3 bg-gray-200" />
          <button onClick={() => setActiveTab('questions')} className={`flex-1 h-full text-[15px] font-medium relative ${activeTab === 'questions' ? 'text-blue-600' : 'text-gray-500'}`}>
            相关问答
            {activeTab === 'questions' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-blue-600 rounded-t-full" />}
          </button>
        </div>
      </header>

      <main className="flex-1 relative w-full h-full overflow-hidden">
        <div className="flex w-[200vw] h-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" 
             style={{ transform: activeTab === 'posts' ? 'translateX(0)' : 'translateX(-50%)' }}>
          
          <div className="w-screen h-full overflow-y-auto pt-[105px] pb-10" onScroll={handleScroll}>
            <InfiniteScroll onLoadMore={() => loadData('posts')} hasMore={postState.hasMore} isLoading={postState.loading}>
              <div className="space-y-1">
                {postState.list.map((post) => (
                  <div key={`post-${post.id}`} onClick={() => handleItemClick('posts', post.id)}>
                    <PostsItem post={post} />
                  </div>
                ))}
              </div>
            </InfiniteScroll>
          </div>

          <div className="w-screen h-full overflow-y-auto pt-[105px] pb-10" onScroll={handleScroll}>
            <InfiniteScroll onLoadMore={() => loadData('questions')} hasMore={questionState.hasMore} isLoading={questionState.loading}>
              <div className="space-y-1">
                {questionState.list.map((q) => (
                  <div key={`q-${q.id}`} onClick={() => handleItemClick('questions', q.id)}>
                    <QuestionsItem question={q} />
                  </div>
                ))}
              </div>
            </InfiniteScroll>
          </div>
          
        </div>
      </main>
    </div>
  );
}