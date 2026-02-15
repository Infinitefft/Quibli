import { create } from 'zustand';
import type { Post } from '@/types/index';
import { fetchPosts } from '@/api/post';


interface HomePostState {
  posts: Post[];
  loadMore: () => Promise<void>;
  loading: boolean;
  hasMore: boolean;
  page: number;
}



export const useHomePostStore = create<HomePostState>((set, get) => ({
  page: 1,   // 响应式，page++
  loading: false,
  hasMore: true,
  posts: [],
  loadMore: async () => {
    if (get().loading || !get().hasMore) return;
    set({loading: true});
    try {
      const { postItems } = await fetchPosts(get().page);
      if (postItems.length === 0) {   // 没有更多了
        set({hasMore: false});
        return;
      } else {
        set({
          posts: [...get().posts, ...postItems],
          page: get().page + 1
        })
      }
    } catch (err) {
      
      console.log("加载失败", err);
    } finally {
      set({ loading: false })
    }
  }
}));

export default useHomePostStore;