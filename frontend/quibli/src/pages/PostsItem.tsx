import { useNavigate} from 'react-router-dom';
import type { Post } from '@/types/index';



interface PostsItemProps {
  post: Post;
}




const PostsItem: React.FC<PostsItemProps> = ({ post }) => {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(`posts/${post.id}`)} className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
      <p className="text-sm text-gray-300">{post.content}</p>
      <p className="text-sm text-gray-300">By {post.user.nickname}</p>
      <p className="text-sm text-gray-300">Posted on {post.publishedAt}</p>
      <p className="text-sm text-gray-300">点赞数: {post.totalLikes}</p>
      <p className="text-sm text-gray-300">收藏数: {post.totalFavorites}</p>
      <p className="text-sm text-gray-300">评论数: {post.totalComments}</p>
      <p className="text-sm text-gray-300">Tags: {post.tags.join(', ')}</p> 
    </div>
  );
}

export default PostsItem; 