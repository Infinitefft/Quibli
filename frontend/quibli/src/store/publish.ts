import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question, Post } from '@/types/index';


interface PublishState {
  // Partial<T> 的作用是把类型 T 中的所有属性都变成“可选的”（Optional）。
  // 在 TypeScript 的严格模式下，如果你创建一个对象，必须一次性填满所有必填字段，否则会报错。
  // 但是 Question, Post 接口还有创建时间等属性，所以使用 Partial 就不会报错了
  currentQuestion: Partial<Question>;
  currentPost: Partial<Post>;
  setQuestionData: (data: Partial<Question>) => void;
  // 更新文章草稿
  setPostData: (data: Partial<Post>) => void;
  
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

      // 重置（发布成功后调用）
      resetQuestion: () => set({ currentQuestion: {} }),
      resetPost: () => set({ currentPost: {} }),
    }),
    {
      name: 'publish-store',
    }
  )
)