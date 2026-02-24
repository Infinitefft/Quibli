import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/SearchInput';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import InfiniteScroll from '@/components/InfiniteScroll';
import { Button } from '@/components/ui/button';
import PostsItem from '@/components/post/PostsItem';
import QuestionsItem from '@/components/question/QuestionsItem';
import UserItem from '@/components/UserItem';
import { SearchPostAndQuestion, SearchUser } from '@/api/search';
import { useSearchResultStore } from '@/store/searchResult';
import BackToTop from '@/components/BackToTop';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';

  const {
    keyword: storeKeyword,
    activeTab,
    postState,
    questionState,
    userState,
    setKeyword,
    setActiveTab,
    setPostState,
    setQuestionState,
    setUserState,
    reset
  } = useSearchResultStore() as any;

  const headerRef = useRef<HTMLElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const postsContainerRef = useRef<HTMLDivElement>(null);
  const questionsContainerRef = useRef<HTMLDivElement>(null);
  const usersContainerRef = useRef<HTMLDivElement>(null);
  
  const lastScrollY = useRef(0);
  const currentTranslateY = useRef(parseInt(sessionStorage.getItem('search_header_translate') || '0'));

  const updateHeader = (translate: number) => {
    currentTranslateY.current = translate;
    sessionStorage.setItem('search_header_translate', translate.toString());
    
    if (headerRef.current) {
      headerRef.current.style.transform = `translate3d(0, ${translate}px, 0)`;
    }
    if (searchBarRef.current) {
      const opacity = Math.max(0, 1 - (Math.abs(translate) / 40));
      searchBarRef.current.style.opacity = opacity.toString();
      searchBarRef.current.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';
    }
  };

  useLayoutEffect(() => {
    const savedPostPos = sessionStorage.getItem('search_posts_scroll');
    const savedQuestionPos = sessionStorage.getItem('search_questions_scroll');
    const savedUserPos = sessionStorage.getItem('search_users_scroll');
    const savedTab = sessionStorage.getItem('search_active_tab');

    if (savedTab) setActiveTab(savedTab);

    if (savedPostPos && postsContainerRef.current) {
      postsContainerRef.current.scrollTop = parseInt(savedPostPos);
    }
    if (savedQuestionPos && questionsContainerRef.current) {
      questionsContainerRef.current.scrollTop = parseInt(savedQuestionPos);
    }
    if (savedUserPos && usersContainerRef.current) {
      usersContainerRef.current.scrollTop = parseInt(savedUserPos);
    }

    const currentContainer = 
      activeTab === 'posts' ? postsContainerRef.current : 
      activeTab === 'questions' ? questionsContainerRef.current : usersContainerRef.current;
    if (currentContainer) {
      lastScrollY.current = currentContainer.scrollTop;
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('search_active_tab', activeTab);
    const container = 
      activeTab === 'posts' ? postsContainerRef.current : 
      activeTab === 'questions' ? questionsContainerRef.current : usersContainerRef.current;
    
    if (container) {
      lastScrollY.current = container.scrollTop;
      if (container.scrollTop < 10) updateHeader(0);
    }
  }, [activeTab]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const storageKey = 
      activeTab === 'posts' ? 'search_posts_scroll' : 
      activeTab === 'questions' ? 'search_questions_scroll' : 'search_users_scroll';
    sessionStorage.setItem(storageKey, scrollTop.toString());

    if (scrollTop < 0) return;
    const deltaY = scrollTop - lastScrollY.current;
    lastScrollY.current = scrollTop;

    let newTranslate = currentTranslateY.current - deltaY;
    newTranslate = Math.max(-57, Math.min(0, newTranslate));
    if (scrollTop <= 0) newTranslate = 0;

    if (newTranslate !== currentTranslateY.current) {
      updateHeader(newTranslate);
    }
  };

  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const distance = touchStartX.current - e.changedTouches[0].clientX;
    const minSwipeDistance = 50;
    const tabs = ['posts', 'questions', 'users'];
    const currentIndex = tabs.indexOf(activeTab);

    if (distance > minSwipeDistance && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else if (distance < -minSwipeDistance && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
    touchStartX.current = null;
  };

  const loadData = async (type: string, isInitial = false) => {
    const stateMap: any = { posts: postState, questions: questionState, users: userState };
    const setMap: any = { posts: setPostState, questions: setQuestionState, users: setUserState };

    const rawState = stateMap[type];
    const state = rawState || { loading: false, hasMore: true, page: 1, list: [], initialized: false };
    const setState = setMap[type];
    
    if (typeof setState !== 'function') return;
    if (state.loading || (!isInitial && !state.hasMore)) return;

    setState((prev: any) => ({ ...(prev || { list: [], page: 1 }), loading: true }));
    try {
      const currentPage = isInitial ? 1 : state.page;
      let items = [];
      
      if (type === 'users') {
        const res: any = await SearchUser(keyword, currentPage, 10);
        items = res?.data || []; 
      } else {
        const apiType = type === 'posts' ? 'post' : 'question';
        const res: any = await SearchPostAndQuestion(keyword, apiType, currentPage);
        items = type === 'posts' ? (res.postItems || res.data) : (res.questionItems || res.data);
      }

      items = items || [];

      setState((prev: any) => {
        const uniqueNewItems = Array.from(new Map(items.map((item: any) => [item.id, item])).values());
        const filteredItems = uniqueNewItems.filter((item: any) => !prev.list.some((existing: any) => existing.id === item.id));
        const newList = isInitial ? filteredItems : [...prev.list, ...filteredItems];
        
        return { 
          list: newList, 
          page: currentPage + 1, 
          hasMore: items.length === 10, 
          loading: false, 
          initialized: true 
        };
      });
    } catch (e) {
      setState((prev: any) => ({ ...prev, loading: false, initialized: true }));
    }
  };

  useEffect(() => {
    if (keyword && keyword !== storeKeyword) {
      reset();
      setKeyword(keyword);
      sessionStorage.removeItem('search_header_translate');
      updateHeader(0);
    }
  }, [keyword, storeKeyword]);

  useEffect(() => {
    if (keyword && storeKeyword === keyword) {
      const states: any = { posts: postState, questions: questionState, users: userState };
      const currentState = states[activeTab];
      if (!currentState || (!currentState.initialized && !currentState.loading)) {
        loadData(activeTab, true);
      }
    }
  }, [activeTab, keyword, storeKeyword, postState, questionState, userState]);

  const initialOpacity = Math.max(0, 1 - (Math.abs(currentTranslateY.current) / 40));

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-50 flex flex-col overflow-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <header 
        ref={headerRef} 
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm will-change-transform pt-10"
        style={{ transform: `translate3d(0, ${currentTranslateY.current}px, 0)` }}
      >
        <div ref={searchBarRef} className="h-[57px] px-2 py-3 flex items-center space-x-2 border-b" style={{ opacity: initialOpacity }}>
          <Button size="icon" variant="ghost" onClick={() => navigate('/searchsuggestions')}>
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div className="flex-1 pr-2">
            <Input
              value={keyword}
              readOnly
              icon={<SearchIcon className="w-4 h-4 text-gray-400" />}
              className="bg-gray-100/80 h-9 text-sm rounded-full cursor-pointer border-transparent"
              onClick={() => navigate('/searchsuggestions')}
            />
          </div>
        </div>

        <div className="h-[48px] flex items-center bg-white border-b">
          {['posts', 'questions', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 h-full text-[15px] font-medium relative transition-colors ${
                activeTab === tab ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {tab === 'posts' ? '文章内容' : tab === 'questions' ? '相关问答' : '用户栏'}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-blue-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 relative w-full h-full overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div
          className="flex w-[300vw] h-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ transform: `translateX(-${activeTab === 'posts' ? 0 : activeTab === 'questions' ? 33.33 : 66.66}%)` }}
        >
          {/* 文章 */}
          <div ref={postsContainerRef} className="w-screen h-full overflow-y-auto no-scrollbar pt-[145px] pb-10" onScroll={handleScroll}>
            <InfiniteScroll onLoadMore={() => loadData('posts')} hasMore={postState.hasMore} isLoading={postState.loading}>
              {postState.initialized && postState.list.length === 0 ? (
                <div className="py-20 text-center text-sm text-gray-400">没有找到相关文章</div>
              ) : (
                <div className="space-y-3">
                  {postState.list.map((post: any) => <PostsItem key={`post-${post.id}`} post={post} />)}
                </div>
              )}
            </InfiniteScroll>
          </div>

          {/* 问答 */}
          <div ref={questionsContainerRef} className="w-screen h-full overflow-y-auto no-scrollbar pt-[145px] pb-10" onScroll={handleScroll}>
            <InfiniteScroll onLoadMore={() => loadData('questions')} hasMore={questionState.hasMore} isLoading={questionState.loading}>
              {questionState.initialized && questionState.list.length === 0 ? (
                <div className="py-20 text-center text-sm text-gray-400">没有找到相关问答</div>
              ) : (
                <div className="space-y-3">
                  {questionState.list.map((q: any) => <QuestionsItem key={`q-${q.id}`} question={q} />)}
                </div>
              )}
            </InfiniteScroll>
          </div>

          {/* 用户栏 */}
          <div ref={usersContainerRef} className="w-screen h-full overflow-y-auto no-scrollbar pt-[145px] pb-10" onScroll={handleScroll}>
            <InfiniteScroll onLoadMore={() => loadData('users')} hasMore={userState?.hasMore} isLoading={userState?.loading}>
              {userState?.initialized && userState?.list?.length === 0 ? (
                <div className="py-20 text-center text-sm text-gray-400">没有找到相关用户</div>
              ) : (
                <div className="space-y-2 px-4">
                  {userState?.list?.map((u: any) => (
                    <UserItem key={`user-${u.id}`} user={u} />
                  ))}
                </div>
              )}
            </InfiniteScroll>
          </div>
        </div>
        <BackToTop 
          targetRef={
            activeTab === 'posts' ? postsContainerRef : 
            activeTab === 'questions' ? questionsContainerRef : usersContainerRef
          } 
        />
      </main>
    </div>
  );
}