import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '@/types/index';
import { MessageSquare, Heart, Star } from 'lucide-react';
import { useUserStore } from '@/store/user'; // 1. 引入 Store

interface PostsItemProps {
  post: Post;
  onClick?: () => void;
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  } catch (e) {
    return dateString;
  }
};

const PostsItem: React.FC<PostsItemProps> = ({ post, onClick }) => {
  const navigate = useNavigate();
  
  // 2. 从 Store 中提取状态和方法
  const { user, likePost, favoritePost, isLogin } = useUserStore();

  // 3. 判断当前用户是否已经点赞/收藏 (基于你定义的 likedPosts 和 collectPosts 数组)
  const isLiked = user?.likePosts?.includes(post.id);
  const isFavorited = user?.favoritePosts?.includes(post.id);

  const displayTags = post.tags
    .slice(0, 3)
    .map(tag => tag.length > 5 ? tag.substring(0, 5) + '...' : tag);

  // 4. 处理点击事件，阻止冒泡以防触发卡片跳转
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLogin) return alert('请先登录');
    likePost(post.id);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLogin) return alert('请先登录');
    favoritePost(post.id);
  };

  return (
    <div 
      onClick={onClick || (() => navigate(`/posts/${post.id}`))}
      className="bg-white mb-[12px] p-7 w-full hover:bg-gray-50 transition-colors cursor-pointer group"
    >
      <div className="flex gap-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-[20px] font-bold text-gray-900 mb-4 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h2>

          <div className="flex items-center mb-5 space-x-3">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {post.user.avatar ? (
                <img src={post.user.avatar} alt={post.user.nickname} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-500 text-[12px] text-white font-bold">
                  {post.user.nickname[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-[15px] font-medium text-gray-700">{post.user.nickname}</span>
            <span className="text-gray-300">·</span>
            <span className="text-[14px] text-gray-400">{formatDate(post.publishedAt)}</span>
          </div>

          <p className="text-[15px] text-gray-500 line-clamp-2 leading-relaxed mb-5">
            {post.content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {displayTags.map((tag, index) => (
                <span key={index} className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[12px] rounded-sm hover:text-blue-600 hover:bg-blue-50 transition-colors border border-gray-100">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-5 text-gray-400">
              {/* 点赞按钮：根据 isLiked 变色 */}
              <div 
                onClick={handleLike}
                className={`flex items-center space-x-1.5 transition-colors hover:text-red-500 ${isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-[14px]">{post.totalLikes || 0}</span>
              </div>

              {/* 收藏按钮：根据 isFavorited 变色 */}
              <div 
                onClick={handleFavorite}
                className={`flex items-center space-x-1.5 transition-colors hover:text-yellow-500 ${isFavorited ? 'text-yellow-500' : ''}`}
              >
                <Star className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                <span className="text-[14px]">收藏</span>
              </div>

              <div className="flex items-center space-x-1.5">
                <MessageSquare className="w-5 h-5" />
                <span className="text-[14px]">{post.totalComments || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(PostsItem);