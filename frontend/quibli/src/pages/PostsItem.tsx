import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '@/types/index';
import { MessageSquare, Heart, Star, MoreHorizontal } from 'lucide-react';

interface PostsItemProps {
  post: Post;
  onClick?: () => void;
}

// Helper to format date
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    // If invalid date, return original string
    if (isNaN(date.getTime())) return dateString;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return dateString;
  }
};

const PostsItem: React.FC<PostsItemProps> = ({ post, onClick }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={onClick || (() => navigate(`/posts/${post.id}`))}
      className="bg-white mb-2 p-4 active:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
    >
      {/* Header: User Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden border border-gray-100">
            {post.user.avatar ? (
                <img src={post.user.avatar} alt={post.user.nickname} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500 text-sm font-bold">
                    {post.user.nickname[0].toUpperCase()}
                </div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[15px] font-semibold text-gray-900 leading-none mb-1">{post.user.nickname}</span>
            <span className="text-xs text-gray-400 font-normal">{formatDate(post.publishedAt)}</span>
          </div>
        </div>
        <button 
          className="text-gray-400 p-2 -mr-2 rounded-full active:bg-gray-100" 
          onClick={(e) => { e.stopPropagation(); /* Action Sheet Logic */ }}
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Body: Content */}
      <div className="flex gap-3 mb-3">
        <div className="flex-1 min-w-0">
            <h2 className="text-[17px] font-bold text-gray-900 mb-1.5 leading-snug line-clamp-2 tracking-tight">
              {post.title}
            </h2>
            <p className="text-[14px] text-gray-600 line-clamp-2 leading-relaxed tracking-wide">
              {post.content}
            </p>
        </div>
        {/* Optional Cover Image */}
        {post.coverImage && (
            <div className="w-[100px] h-[75px] rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden ml-1">
                <img src={post.coverImage} className="w-full h-full object-cover" alt="cover" />
            </div>
        )}
      </div>

      {/* Footer: Tags & Stats */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-2 overflow-hidden flex-1 mr-4">
             {post.tags.slice(0, 3).map(tag => (
                 <span key={tag} className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md whitespace-nowrap font-medium">
                     #{tag}
                 </span>
             ))}
        </div>
        
        <div className="flex items-center space-x-5 text-gray-500">
            <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 stroke-[2.5]" />
                <span className="text-xs font-medium">{post.totalLikes}</span>
            </div>
            <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                <span className="text-xs font-medium">{post.totalComments}</span>
            </div>
            <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 stroke-[2.5]" />
                <span className="text-xs font-medium">{post.totalFavorites}</span>
            </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(PostsItem);