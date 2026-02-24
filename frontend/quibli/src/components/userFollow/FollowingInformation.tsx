import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import InfiniteScroll from '@/components/InfiniteScroll';
import UserItem from '@/components/UserItem';
// 确保 api 包含这两个方法
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
    // 物理锁：防止正在加载或无更多数据时触发
    if (userState.loading || (!isInitial && !userState.hasMore)) return;
    
    const currentPage = isInitial ? 1 : userState.page;
    if (fetchingPage.current === currentPage) return;
    if (!routeUserId) return;

    setUserState(prev => ({ ...prev, loading: true }));
    fetchingPage.current = currentPage;

    try {
      // 根据类型动态选择 API
      const fetchApi = listType === 'followers' ? getFollowers : getFollowedUsers;
      // 传入 userId, page, limit
      const res: any = await fetchApi(Number(routeUserId), currentPage, 10);
      
      // 适配后端 key: followedUsers 或 followers
      const items = res?.followedUsers || res?.followers || [];

      setUserState(prev => {
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

  // 当路由参数或类型切换时，重置并初始化
  useEffect(() => {
    setUserState({
      list: [],
      page: 1,
      hasMore: true,
      loading: false,
      initialized: false,
    });
    fetchingPage.current = 0;
    loadData(true);
  }, [routeUserId, listType]); 

  return (
    <div 
      ref={usersContainerRef} 
      className="w-full h-full overflow-y-auto no-scrollbar" 
    >
      <InfiniteScroll 
        onLoadMore={() => loadData()} 
        hasMore={userState.hasMore} 
        isLoading={userState.loading}
      >
        <div className="pb-10">
          {userState.initialized && userState.list.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              {/* <div className="w-16 h-16 mb-2 bg-gray-50 rounded-full flex items-center justify-center">
                <span className="text-2xl">👻</span>
              </div> */}
              <p className="text-sm">{listType === 'following' ? '还没有关注任何人' : '还没有粉丝'}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 px-2">
              {userState.list.map((u) => (
                <UserItem key={`${listType}-${u.id}`} user={u} />
              ))}
            </div>
          )}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default FollowingInformation;