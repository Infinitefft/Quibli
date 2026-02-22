import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/user';

interface UserItemProps {
  user: any;
  extra?: React.ReactNode;
  onClick?: () => void;
}

const UserItem: React.FC<UserItemProps> = ({ user, extra, onClick }) => {
  const navigate = useNavigate();
  
  // 1. 从 Store 中获取登录状态和 follow 方法
  const isLogin = useUserStore((state: any) => state.isLogin);
  const follow = useUserStore((state: any) => state.follow);

  // 2. 核心进阶：直接根据 Store 里的 following 数组判断状态
  // 这样就不需要本地的 useState 了，状态全站同步
  const isFollowed = useUserStore((state: any) => 
    state.user?.following?.includes(user.id)
  );

  const handleDefaultClick = () => {
    if (onClick) return onClick();
    navigate(`/user/${user.id}`);
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isLogin) {
      navigate('/login');
      return;
    }
    // 3. 直接调用 Store 里的 follow 逻辑（逻辑已经在 useStore 里实现了）
    follow(user.id);
  };

  const formatCount = (num: number) => {
    if (!num) return '0';
    return num >= 10000 ? (num / 10000).toFixed(1) + 'w' : num;
  };

  return (
    <div className="w-full select-none">
      <div 
        onClick={handleDefaultClick}
        className="w-full flex items-center justify-between px-2 py-4 active:bg-black/[0.02] cursor-pointer"
      >
        <div className="flex items-center space-x-3 overflow-hidden flex-1">
          {/* 头像 */}
          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-[#3B82F6]">
            {user.avatar ? (
              <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xl font-bold">
                {user.nickname?.[0]?.toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex flex-col space-y-0.5 overflow-hidden">
            <span className="text-[17px] text-gray-950 font-bold truncate">
              {user.nickname}
            </span>
            
            <div className="flex items-center text-[13px] text-gray-600 font-medium">
              <span>{formatCount(user._count?.followedBy)} 粉丝</span>
              <span className="mx-2 text-gray-200">|</span>
              <span>{formatCount(user._count?.posts)} 作品</span>
            </div>

            <div className="text-[11px] text-gray-400 font-mono scale-90 origin-left">
              UID: {user.id}
            </div>
          </div>
        </div>

        {/* 关注按钮：直接监听全局状态 isFollowed */}
        <div className="relative z-10 flex-shrink-0 ml-4">
          {extra || (
            <button 
              onClick={handleFollow}
              className={`
                h-9 px-6 text-[14px] font-black tracking-tight rounded-full select-none min-w-[90px] flex items-center justify-center
                ${isFollowed 
                  ? 'bg-gray-100 text-gray-500 border-none' 
                  : 'bg-transparent border-[1.5px] border-gray-950 text-gray-950'
                }
              `}
            >
              {isFollowed ? '已关注' : '+ 关注'}
            </button>
          )}
        </div>
      </div>

      <div className="px-2">
        <div className="h-[0.5px] w-full bg-gray-200" />
      </div>
    </div>
  );
};

export default React.memo(UserItem);