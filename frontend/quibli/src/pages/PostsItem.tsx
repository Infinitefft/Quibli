import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '@/types/index';
import { MessageSquare, Heart, Star, MoreHorizontal } from 'lucide-react';

interface PostsItemProps {
  post: Post;
}

const PostsItem: React.FC<PostsItemProps> = ({ post }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`posts/${post.id}`)} 
      className="bg-white mb-2 p-4 active:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
    >
      {/* Header: User Info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
            {post.user.avatar ? (
                <img src={post.user.avatar} alt={post.user.nickname} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500 text-xs font-bold">
                    {post.user.nickname[0].toUpperCase()}
                </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 leading-none">{post.user.nickname}</span>
            <span className="text-xs text-gray-400 mt-0.5">{post.publishedAt}</span>
          </div>
        </div>
        <button 
          className="text-gray-400 p-1 -mr-2" 
          onClick={(e) => { e.stopPropagation(); /* Action Sheet Logic */ }}
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Body: Content */}
      <div className="flex space-x-3 mb-3">
        <div className="flex-1">
            <h2 className="text-base font-bold text-gray-900 mb-1 leading-snug line-clamp-2">
            {post.title}
            </h2>
            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
            {post.content}
            </p>
        </div>
        {/* Optional Cover Image */}
        {post.coverImage && (
            <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                <img src={post.coverImage} className="w-full h-full object-cover" alt="cover" />
            </div>
        )}
      </div>

      {/* Footer: Tags & Stats */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-hidden">
             {post.tags.slice(0, 3).map(tag => (
                 <span key={tag} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                     #{tag}
                 </span>
             ))}
        </div>
        
        <div className="flex items-center space-x-4 text-gray-400">
            <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span className="text-xs">{post.totalLikes}</span>
            </div>
            <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs">{post.totalComments}</span>
            </div>
            <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span className="text-xs">{post.totalFavorites}</span>
            </div>
        </div>
      </div>
    </div>
  );
}

// Memoize the component to prevent re-renders when parent state (header scroll) changes
export default React.memo(PostsItem);