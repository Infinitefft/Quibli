import React, { useEffect, useState, useRef, useCallback } from 'react';
import InfiniteScroll from '@/components/InfiniteScroll';
import UserItem from '@/components/UserItem';
import { getFollowedUsers } from '@/api/user';
import type { User } from '@/types';

const FollowingInformation = () => {
  // 严格迁移 SearchPage 的 state 结构
  const [userState, setUserState] = useState({
    list: [] as User[],
    page: 1,
    hasMore: true,
    loading: false,
    initialized: false,
  });

  const usersContainerRef = useRef<HTMLDivElement>(null);
  const fetchingPage = useRef<number>(0); // 物理锁，防止重复请求

  const loadData = useCallback(async (isInitial = false) => {
    // 基础拦截
    if (userState.loading || (!isInitial && !userState.hasMore)) return;
    
    const currentPage = isInitial ? 1 : userState.page;
    
    // 页码锁拦截
    if (fetchingPage.current === currentPage) return;

    setUserState(prev => ({ ...prev, loading: true }));
    fetchingPage.current = currentPage;

    try {
      // 调用已支持可选分页的接口
      const res: any = await getFollowedUsers(currentPage, 10);
      const items = res?.followedUsers || [];

      setUserState(prev => {
        // 过滤重复数据，确保 list 唯一性
        const existingIds = new Set(prev.list.map(u => u.id));
        const uniqueNewItems = items.filter((u: User) => !existingIds.has(u.id));
        
        const newList = isInitial ? items : [...prev.list, ...uniqueNewItems];

        return {
          list: newList,
          page: currentPage + 1,
          hasMore: items.length === 10,
          loading: false,
          initialized: true,
        };
      });
    } catch (error) {
      console.error("加载关注列表失败:", error);
      setUserState(prev => ({ ...prev, loading: false, initialized: true }));
    } finally {
      fetchingPage.current = 0; // 释放锁
    }
  }, [userState.loading, userState.hasMore, userState.page]);

  // 初始化加载：仅在未初始化时触发
  useEffect(() => {
    if (!userState.initialized) {
      loadData(true);
    }
  }, [loadData, userState.initialized]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // 预留位置记录逻辑，如果需要持久化滚动位置可在此添加 sessionStorage
    const scrollTop = e.currentTarget.scrollTop;
    sessionStorage.setItem('following_users_scroll', scrollTop.toString());
  };

  // 组件挂载时恢复滚动位置
  useEffect(() => {
    const savedPos = sessionStorage.getItem('following_users_scroll');
    if (savedPos && usersContainerRef.current) {
      usersContainerRef.current.scrollTop = parseInt(savedPos);
    }
  }, []);

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
              你还没有关注任何人
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