import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '@/types/index';
import { MessageSquare, Heart, Star } from 'lucide-react';

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

  // 标签处理逻辑：最多3个，每个不超过7个字
  const displayTags = post.tags
    .slice(0, 3)
    .map(tag => tag.length > 7 ? tag.substring(0, 7) + '...' : tag);

  return (
    <div 
      onClick={onClick || (() => navigate(`/posts/${post.id}`))}
      className="bg-white mb-[10px] p-6 w-full hover:bg-gray-50 transition-colors cursor-pointer group"
    >
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {/* 第一行：标题 */}
          <h2 className="text-[18px] font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h2>

          {/* 第二行：用户头像、昵称、日期 */}
          <div className="flex items-center mb-4 space-x-2">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {post.user.avatar ? (
                <img 
                  src={post.user.avatar} 
                  alt={post.user.nickname} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-500 text-[10px] text-white font-bold">
                  {post.user.nickname[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-[14px] font-medium text-gray-700">{post.user.nickname}</span>
            <span className="text-gray-300">·</span>
            <span className="text-[13px] text-gray-400">{formatDate(post.publishedAt)}</span>
          </div>

          {/* 第三行：正文内容 */}
          <p className="text-[14px] text-gray-500 line-clamp-2 leading-relaxed mb-4">
            {post.content}
          </p>

          {/* 第四行：标签与交互数据 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {displayTags.map((tag, index) => (
                <span 
                  key={index} 
                  className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[12px] rounded-sm hover:text-blue-600 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-4 text-gray-400">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span className="text-[13px]">{post.totalLikes || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span className="text-[13px]">{post.totalComments || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧封面图（如有） */}
        {post.coverImage && (
          <div className="hidden md:block w-[140px] h-[92px] rounded-sm overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100 self-center">
            <img 
              src={post.coverImage} 
              alt="cover" 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(PostsItem);