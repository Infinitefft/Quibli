import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/SearchInput';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import InfiniteScroll from '@/components/InfiniteScroll';
import { Button } from '@/components/ui/button';
import PostsItem from '@/pages/PostsItem';
import QuestionsItem from '@/pages/QuestionsItem';
import { SearchPostAndQuestion } from '@/api/search';
import { useSearchResultStore } from '@/store/searchResult';

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
  const currentTranslateY = useRef(0);

  // --- Header 隐藏动画逻辑 ---
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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
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

  // --- 左右滑动切换逻辑 (三个栏目) ---
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

  // --- 加载数据逻辑（含完整去重）---
  const loadData = async (type: string, isInitial = false) => {
    const stateMap: any = { posts: postState, questions: questionState, users: userState };
    const setMap: any = { posts: setPostState, questions: setQuestionState, users: setUserState };
    const apiMap: any = { posts: 'post', questions: 'question', users: 'user' };

    const state = stateMap[type];
    const setState = setMap[type];
    if (!state || state.loading || (!isInitial && !state.hasMore)) return;

    setState((prev: any) => ({ ...prev, loading: true }));
    try {
      const currentPage = isInitial ? 1 : state.page;
      const res: any = await SearchPostAndQuestion(keyword, apiMap[type], currentPage);
      
      // 获取对应类型的数据
      let items = [];
      if (type === 'posts') items = res.postItems || [];
      else if (type === 'questions') items = res.questionItems || [];
      else items = res.userItems || [];

      // 核心去重逻辑：1. 新数据自身去重 2. 过滤已存在项
      setState((prev: any) => {
        // 步骤1: 新数据自身去重（防止API返回重复）
        const uniqueNewItems = Array.from(
          new Map(items.map((item: any) => [item.id, item])).values()
        );
        
        // 步骤2: 过滤掉已在列表中存在的项
        const filteredItems = uniqueNewItems.filter(
          (item: any) => !prev.list.some((existing: any) => existing.id === item.id)
        );
        
        // 合并列表
        const newList = isInitial 
          ? filteredItems 
          : [...prev.list, ...filteredItems];
        
        return {
          list: newList,
          page: currentPage + 1, // 下次加载的页码
          hasMore: filteredItems.length === 10, // 严格按去重后数量判断
          loading: false,
          initialized: true
        };
      });
    } catch (e) {
      console.error(`加载${type}数据失败:`, e);
      setState((prev: any) => ({ ...prev, loading: false, initialized: true }));
    }
  };

  useEffect(() => {
    if (keyword && keyword !== storeKeyword) {
      reset();
      setKeyword(keyword);
    }
  }, [keyword, storeKeyword, reset, setKeyword]);

  useEffect(() => {
    if (keyword && storeKeyword === keyword) {
      const states: any = { posts: postState, questions: questionState, users: userState };
      const currentState = states[activeTab];
      if (currentState && !currentState.initialized && !currentState.loading) {
        loadData(activeTab, true);
      }
    }
  }, [activeTab, keyword, storeKeyword, postState.initialized, questionState.initialized, userState?.initialized]);

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-50 flex flex-col overflow-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Header: 已去掉头像，仅保留返回和搜索框 */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm will-change-transform">
        <div ref={searchBarRef} className="h-[57px] px-2 py-3 flex items-center space-x-2 border-b">
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

        {/* 三个 Tab */}
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

      {/* 内容区域：支持滑动 */}
      <main
        className="flex-1 relative w-full h-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex w-[300vw] h-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ transform: `translateX(-${activeTab === 'posts' ? 0 : activeTab === 'questions' ? 33.33 : 66.66}%)` }}
        >
          {/* 文章 */}
          <div ref={postsContainerRef} className="w-screen h-full overflow-y-auto no-scrollbar pt-[105px] pb-10" onScroll={handleScroll}>
            <InfiniteScroll onLoadMore={() => loadData('posts')} hasMore={postState.hasMore} isLoading={postState.loading}>
              {postState.initialized && postState.list.length === 0 ? (
                <div className="py-20 text-center text-sm text-gray-400">没有找到相关文章</div>
              ) : (
                <div className="space-y-3">
                  {postState.list.map((post: any) => (
                    <PostsItem key={`post-${post.id}`} post={post} />
                  ))}
                </div>
              )}
            </InfiniteScroll>
          </div>

          {/* 问答 */}
          <div ref={questionsContainerRef} className="w-screen h-full overflow-y-auto no-scrollbar pt-[105px] pb-10" onScroll={handleScroll}>
            <InfiniteScroll onLoadMore={() => loadData('questions')} hasMore={questionState.hasMore} isLoading={questionState.loading}>
              {questionState.initialized && questionState.list.length === 0 ? (
                <div className="py-20 text-center text-sm text-gray-400">没有找到相关问答</div>
              ) : (
                <div className="space-y-3">
                  {questionState.list.map((q: any) => (
                    <QuestionsItem key={`q-${q.id}`} question={q} />
                  ))}
                </div>
              )}
            </InfiniteScroll>
          </div>

          {/* 用户列表 */}
          <div ref={usersContainerRef} className="w-screen h-full overflow-y-auto no-scrollbar pt-[105px] pb-10" onScroll={handleScroll}>
            <InfiniteScroll onLoadMore={() => loadData('users')} hasMore={userState?.hasMore} isLoading={userState?.loading}>
              {userState?.initialized && userState?.list?.length === 0 ? (
                <div className="py-20 text-center text-sm text-gray-400">没有找到相关用户</div>
              ) : (
                <div className="space-y-2 px-4">
                  {userState?.list?.map((u: any) => (
                    <div 
                      key={`user-${u.id}`} 
                      className="bg-white rounded-xl p-4 flex items-center border border-gray-100 hover:shadow-sm transition-shadow active:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/user/${u.id}`)}
                    >
                      <img 
                        src={u.avatar} 
                        alt={u.nickname}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = '/default-avatar.png';
                          e.currentTarget.classList.add('bg-gray-200');
                        }}
                      />
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="text-[16px] font-semibold text-gray-900 truncate">{u.nickname}</div>
                        <div className="text-[13px] text-gray-500 line-clamp-1 mt-0.5">{u.bio || '暂无简介'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </InfiniteScroll>
          </div>
        </div>
      </main>
    </div>
  );
}