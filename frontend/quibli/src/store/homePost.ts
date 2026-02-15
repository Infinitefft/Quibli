import { create } from 'zustand';
import type { Post } from '@/types/index';
import { fetchPosts } from '@/api/post';


interface HomePostState {
  posts: Post[];
  loadMorePosts: () => Promise<void>;
  loadingPosts: boolean;
  hasMorePosts: boolean;
  postPage: number;
}



export const useHomePostStore = create<HomePostState>((set, get) => ({
  postPage: 1,   // 响应式，page++
  hasMorePosts: true,
  loadingPosts: false,
  posts: [],
  loadMorePosts: async () => {
    if (get().loadingPosts || !get().hasMorePosts) return;
    set({loadingPosts: true});
    try {
      const { postItems } = await fetchPosts(get().postPage);
      if (postItems.length === 0) {   // 没有更多了
        set({hasMorePosts: false});
        return;
      } else {
        set({
          posts: [...get().posts, ...postItems],
          postPage: get().postPage + 1
        })
      }
    } catch (err) {

      console.log("加载失败", err);
    } finally {
      set({ loadingPosts: false })
    }
  }
}));

export default useHomePostStore;