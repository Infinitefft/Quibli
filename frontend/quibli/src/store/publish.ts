import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question, Post } from '@/types/index';
import { publishPosts } from '@/api/post';
import { publishQuestions } from '@/api/question';

interface PublishState {
  // Partial<T> 的作用是把类型 T 中的所有属性都变成“可选的”（Optional）。
  // 在 TypeScript 的严格模式下，如果你创建一个对象，必须一次性填满所有必填字段，否则会报错。
  // 但是 Question, Post 接口还有创建时间等属性，所以使用 Partial 就不会报错了
  currentQuestion: Partial<Question>;
  currentPost: Partial<Post>;
  setQuestionData: (data: Partial<Question>) => void;
  // 更新文章草稿
  setPostData: (data: Partial<Post>) => void;

  submitQuestion: () => Promise<void>;
  submitPost: () => Promise<void>;

  // 重置方法（发布成功或清空时调用）
  resetQuestion: () => void;
  resetPost: () => void;
}



export const usePublishStore = create<PublishState>()(
    persist((set, get) => ({
      currentQuestion: {
        title: '',
        tags: [],
      },
      currentPost: {
        title: '',
        content: '',
        tags: [],
      },
      // state: 永远是上一次更新完成后的最终结果
      setQuestionData: (data: Partial<Question>) => set((state: PublishState) => ({
        currentQuestion: { 
          ...state.currentQuestion, 
          ...data 
        }
      })),

      // 更新文章草稿
      setPostData: (data: Partial<Post>) => set((state: PublishState) => ({
        currentPost: { 
          ...state.currentPost, 
          ...data 
        }
      })),

      submitPost: async () => {
        const { currentPost, resetPost } = get();

        try {
          // 这里的 res 因为你的拦截器，已经是后端返回的 data 部分了
          await publishPosts(currentPost);
          // 发布成功，清理本地草稿
          resetPost();
        } catch (err) {
          console.error('提交失败:', err);
          throw err;
        }
      },
      submitQuestion: async () => {
        const { currentQuestion, resetQuestion } = get();
        try {
          await publishQuestions(currentQuestion);
          // 发布成功，清理本地草稿
          resetQuestion();
        } catch (err) {
          console.error('提交失败:', err);
          throw err;
        }
      },

      // 重置
      // 必须给 tags 初始值 []
      resetQuestion: () => set({ 
        currentQuestion: { 
          title: '', 
          tags: [] 
        } 
      }),
      resetPost: () => set({ 
        currentPost: { 
          title: '', 
          content: '', 
          tags: [] 
        } 
      }),
    }),
    {
      name: 'publish-store',
    }
  )
)