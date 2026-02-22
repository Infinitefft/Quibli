import React from 'react';
import { useNavigate } from 'react-router-dom';

interface UserItemProps {
  user: any;
  extra?: React.ReactNode; // 预留右侧区域，比如放“关注”按钮或“时间”
  onClick?: () => void;    // 支持自定义点击事件
}

export default function UserItem({ user, extra, onClick }: UserItemProps) {
  const navigate = useNavigate();

  const defaultClick = () => {
    if (onClick) return onClick();
    navigate(`/user/${user.id}`);
  };

  const formatCount = (num: number) => {
    return num >= 10000 ? (num / 10000).toFixed(1) + 'w' : (num || 0);
  };

  return (
    <div 
      className="bg-white rounded-xl p-4 flex items-center active:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer shadow-sm border border-gray-50"
      onClick={defaultClick}
    >
      {/* 头像 */}
      <div className="w-12 h-12 rounded-full bg-blue-50 flex-shrink-0 overflow-hidden border border-gray-100">
        {user.avatar ? (
          <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-blue-400 text-lg font-bold">
            {user.nickname?.charAt(0)}
          </div>
        )}
      </div>

      {/* 信息区 */}
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="text-[16px] font-semibold text-gray-900 truncate">
            {user.nickname}
          </div>
          {/* 这里可以放 UID 或者传入的 extra */}
          {!extra && <span className="text-[11px] text-gray-400">UID: {user.id}</span>}
        </div>
        
        <div className="text-[13px] text-gray-500 line-clamp-1 mt-0.5">
          {user.bio || '暂无简介'}
        </div>

        <div className="flex items-center mt-1 text-[12px] text-gray-400 space-x-3">
          <span>粉丝 {formatCount(user._count?.followedBy)}</span>
          <span>作品 {formatCount(user._count?.posts)}</span>
        </div>
      </div>

      {/* 侧边扩展区 */}
      {extra && <div className="ml-2">{extra}</div>}
    </div>
  );
}