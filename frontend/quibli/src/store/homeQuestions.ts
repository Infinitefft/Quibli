import { create } from 'zustand';
import type { Post } from '@/types/index';
import type { Question } from '@/types/index';
import { fetchQuestions } from '@/api/question';


interface HomeQuestionState {
  questions: Question[];
  loadMore: () => Promise<void>;
  loading: boolean;
  hasMore: boolean;
  page: number;
}



export const useHomeQuestionStore = create<HomeQuestionState>((set, get) => ({
  page: 1,   // 响应式，page++
  loading: false,
  hasMore: true,
  questions: [],
  loadMore: async () => {
    if (get().loading) return;
    set({loading: true});
    try {
      const { questionItems } = await fetchQuestions(get().page);
      if (questionItems.length === 0) {   // 没有更多了
        set({hasMore: false});
        return;
      } else {
        set({
          questions: [...get().questions, ...questionItems],
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

export default useHomeQuestionStore;
