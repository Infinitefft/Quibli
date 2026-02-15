import { create } from 'zustand';
import type { Post } from '@/types/index';
import type { Question } from '@/types/index';
import { fetchQuestions } from '@/api/question';


interface HomeQuestionState {
  questions: Question[];
  loadMoreQuestions: () => Promise<void>;
  loadingQuestions: boolean;
  hasMoreQuestions: boolean;
  questionsPage: number;
}



export const useHomeQuestionStore = create<HomeQuestionState>((set, get) => ({
  questionsPage: 1,   // 响应式，page++
  loadingQuestions: false,
  hasMoreQuestions: true,
  questions: [],
  loadMoreQuestions: async () => {
    if (get().loadingQuestions) return;
    set({loadingQuestions: true});
    try {
      const { questionItems } = await fetchQuestions(get().questionsPage);
      if (questionItems.length === 0) {   // 没有更多了
        set({hasMoreQuestions: false});
        return;
      } else {
        set({
          questions: [...get().questions, ...questionItems],
          questionsPage: get().questionsPage + 1
        })
      }
    } catch (err) {
      console.log("加载失败", err);
    } finally {
      set({ loadingQuestions: false })
    }
  }
}));

export default useHomeQuestionStore;
