import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '@/types/index';
import { MessageSquare, Heart, Star } from 'lucide-react';
import { useUserStore } from '@/store/user';

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
  const { user, likePost, favoritePost, isLogin } = useUserStore();

  const isLiked = user?.likePosts?.includes(post.id);
  const isFavorited = user?.favoritePosts?.includes(post.id);

  const displayTags = post.tags.slice(0, 3);

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
      className="bg-white mb-[12px] p-6 w-full active:bg-gray-50 transition-colors cursor-pointer group"
    >
      {/* 1. 顶部：用户信息 */}
      <div className="flex items-center mb-3 space-x-2">
        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {post.user.avatar ? (
            <img src={post.user.avatar} alt={post.user.nickname} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-500 text-[10px] text-white font-bold">
              {post.user.nickname[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <span className="text-[14px] font-medium text-gray-600">{post.user.nickname}</span>
        <span className="text-gray-300">·</span>
        <span className="text-[12px] text-gray-400">{formatDate(post.publishedAt)}</span>
      </div>

      {/* 2. 中部：标题与内容预览 */}
      <h2 className="text-[18px] font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
        {post.title}
      </h2>
      <p className="text-[14px] text-gray-500 line-clamp-2 leading-relaxed mb-4">
        {post.content}
      </p>

      {/* 3. 标签行：独立出一行 */}
      <div className="flex items-center gap-2 mb-5">
        {displayTags.map((tag, index) => (
          <span key={index} className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[11px] rounded-sm border border-gray-100">
            {tag}
          </span>
        ))}
      </div>

      {/* 4. 底部交互行：点赞、收藏、评论 */}
      <div className="flex items-center space-x-8 text-gray-400 border-t border-gray-50 pt-4">
        {/* 点赞 */}
        <div 
          onClick={handleLike}
          className={`flex items-center space-x-1.5 active:scale-90 transition-all ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
        >
          <Heart className={`w-5 h-5 stroke-[2.2] ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-[13px] font-semibold">{post.totalLikes || 0}</span>
        </div>

        {/* 收藏 */}
        <div 
          onClick={handleFavorite}
          className={`flex items-center space-x-1.5 active:scale-90 transition-all ${isFavorited ? 'text-yellow-500' : 'hover:text-yellow-500'}`}
        >
          <Star className={`w-5 h-5 stroke-[2.2] ${isFavorited ? 'fill-current' : ''}`} />
          <span className="text-[13px] font-semibold">{isFavorited ? '已收藏' : '收藏'}</span>
        </div>

        {/* 评论 */}
        <div className="flex items-center space-x-1.5">
          <MessageSquare className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[13px] font-semibold">{post.totalComments || 0}</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(PostsItem);