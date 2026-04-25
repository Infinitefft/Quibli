import { create } from 'zustand';
import type { Post } from '@/types/index';
import { fetchPosts } from '@/api/post';


interface HomePostState {
  posts: Post[];
  loadMorePosts: () => Promise<void>;
  prefetchPosts: () => void;
  loadingPosts: boolean;
  hasMorePosts: boolean;
  postPage: number;
}


let prefetchPromiseArr: Promise<{ postItems: Post[] }> | null = null;
let prefetchedPage: number | null = null;



export const useHomePostStore = create<HomePostState>((set, get) => ({
  postPage: 1,   // 响应式，page++
  hasMorePosts: true,
  loadingPosts: false,
  posts: [],
  prefetchPosts: () => {
    const { loadingPosts, hasMorePosts, postPage } = get();
    if (loadingPosts || !hasMorePosts) return;   // 正在加载或没有了
    if (prefetchedPage === postPage) return;  // 防止重复
    // console.log(`第${postPage}页`);
    prefetchPromiseArr = fetchPosts(postPage);
    prefetchedPage = postPage;
  },
  loadMorePosts: async () => {
    if (get().loadingPosts || !get().hasMorePosts) return;
    set({loadingPosts: true});
    try {
      const targetPage = get().postPage;
      let res;
      if (prefetchPromiseArr && prefetchedPage === targetPage) {
        res = await prefetchPromiseArr;  // 预请求的
        // console.log('prefetchPromiseArr:', res)
      } else {
        res = await fetchPosts(targetPage);
      }
      // 用完清空
      prefetchPromiseArr = null;
      prefetchedPage = null;

      const { postItems } = res;
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