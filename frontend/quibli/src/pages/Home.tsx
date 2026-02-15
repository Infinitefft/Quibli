import {
  useEffect,
} from 'react';

import { Input } from '@/components/ui/SearchInput';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { Search, Bell } from 'lucide-react';
import PostsItem from '@/pages/PostsItem'
import useHomePostStore from '@/store/homePost';
import InfiniteScroll from '@/components/InfiniteScroll';



export default function Home() {
  const { scrollDirection, isAtTop } = useScrollDirection();
  const isHidden = scrollDirection === 'down' && !isAtTop;
  
  const { loading, loadMore, posts, hasMore } = useHomePostStore();

  useEffect(() => {
    loadMore();
  }, []);
  return (
    <>

      {/* 搜索框------------------------- */}
      <header 
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isHidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
          ${isAtTop ? 'bg-white pt-2 pb-2' : 'bg-white/90 backdrop-blur-md shadow-sm pt-2 pb-2'}
          `}
        >
        <div className="max-w-md mx-auto px-4 flex items-center space-x-3">
          <div className="flex-1 transform transition-all duration-300">
            <Input 
              placeholder="搜索你感兴趣的内容..." 
              icon={<Search className="w-4 h-4" />}
              className="bg-gray-100/80 border-transparent focus:bg-white focus:border-gray-200"
            />
          </div>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <InfiniteScroll
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoading={loading}
      >
        <div>
          {
            posts.map((post) => (
              <PostsItem key={post.id} post={post} />
            ))
          }
        </div>
      </InfiniteScroll>
      
    </>
  );
}