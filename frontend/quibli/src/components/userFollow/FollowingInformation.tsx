import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import InfiniteScroll from '@/components/InfiniteScroll';
import UserItem from '@/components/UserItem';
import { getFollowedUsers, getFollowers } from '@/api/user';
import type { User } from '@/types';

const FollowingInformation = () => {
  const { userId: routeUserId } = useParams();
  const [searchParams] = useSearchParams();
  const listType = (searchParams.get('type') as 'following' | 'followers') || 'following';

  const [userState, setUserState] = useState({
    list: [] as User[],
    page: 1,
    hasMore: true,
    loading: false,
    initialized: false,
  });

  const usersContainerRef = useRef<HTMLDivElement>(null);
  const fetchingPage = useRef<number>(0);

  const loadData = useCallback(async (isInitial = false) => {
    // 如果正在加载，或者非初始化加载且没有更多数据，则拦截
    if (userState.loading || (!isInitial && !userState.hasMore)) return;
    
    const currentPage = isInitial ? 1 : userState.page;
    
    // 物理锁：防止同一页重复请求
    if (fetchingPage.current === currentPage) return;
    if (!routeUserId) return;

    setUserState(prev => ({ ...prev, loading: true }));
    fetchingPage.current = currentPage;

    try {
      const fetchApi = listType === 'followers' ? getFollowers : getFollowedUsers;
      const res: any = await fetchApi(Number(routeUserId), currentPage, 10);
      
      // 对应后端的 key: followedUsers 或 followers
      const items = res?.followedUsers || res?.followers || [];

      setUserState(prev => {
        // 如果是初始化，直接覆盖列表；否则追加并去重
        const newList = isInitial 
          ? items 
          : [...prev.list, ...items.filter((u: User) => !prev.list.some(ex => ex.id === u.id))];

        return {
          list: newList,
          page: currentPage + 1,
          hasMore: items.length === 10,
          loading: false,
          initialized: true,
        };
      });
    } catch (error) {
      console.error(`加载${listType}失败:`, error);
      setUserState(prev => ({ ...prev, loading: false, initialized: true }));
    } finally {
      fetchingPage.current = 0;
    }
  }, [userState.loading, userState.hasMore, userState.page, routeUserId, listType]);

  // 当路由参数或类型切换时，直接执行初始化加载
  useEffect(() => {
    // 重置状态
    setUserState({
      list: [],
      page: 1,
      hasMore: true,
      loading: false,
      initialized: false,
    });
    fetchingPage.current = 0;
    
    // 立即执行第一次加载
    loadData(true);
  }, [routeUserId, listType]); // 删掉了对 loadData 的依赖，避免闭包带来的副作用，或确保 loadData 足够稳定

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    sessionStorage.setItem(`follow_scroll_${routeUserId}_${listType}`, scrollTop.toString());
  };

  useEffect(() => {
    const savedPos = sessionStorage.getItem(`follow_scroll_${routeUserId}_${listType}`);
    // 增加一个延时，确保 DOM 渲染完成（尤其是在有数据加载时）
    const timer = setTimeout(() => {
      if (savedPos && usersContainerRef.current) {
        usersContainerRef.current.scrollTop = parseInt(savedPos);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [routeUserId, listType, userState.initialized]); // 增加 initialized 依赖，确保数据出来后再滚

  return (
    <div 
      ref={usersContainerRef} 
      className="w-full h-full overflow-y-auto no-scrollbar" 
      onScroll={handleScroll}
    >
      <InfiniteScroll 
        onLoadMore={() => loadData()} 
        hasMore={userState.hasMore} 
        isLoading={userState.loading}
      >
        <div className="pb-10">
          {userState.initialized && userState.list.length === 0 ? (
            <div className="py-20 text-center text-sm text-gray-400">
              {listType === 'following' ? '暂无关注的人' : '暂无粉丝'}
            </div>
          ) : (
            <div className="space-y-2 px-4 pt-4">
              {userState.list.map((u) => (
                <UserItem key={`user-${u.id}`} user={u} />
              ))}
            </div>
          )}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default FollowingInformation;