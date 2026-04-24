import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSearchSuggestions } from '@/api/search';


interface SearchSuggestionsState {
  loading: boolean;
  suggestions: string[];
  history: string[];
  searchSuggestions: (keyword: string) => Promise<void>;
  addHistory: (keyword: string) => void;
  delete: (id: number) => void;
  clearHistory: () => void;
}



// 模块作用域变量，记录当前请求的请求ID
// 用于解决竞态问题
let currentSearchRequsetId = 0;


export const useSearchSuggestionsStore = create<SearchSuggestionsState>()(
  persist((set, get) => ({
    loading: false,
    suggestions: [],
    history: [],
    searchSuggestions: async (keyword: string) => {
      if (!keyword.trim()) {   // 搜索框没东西
        set({ suggestions: []});  // 搜索建议列表清空
        return 
      }


      // 每次调用时递增ID，并且闭包在当前函数中
      const requestId = ++currentSearchRequsetId;

      set({ loading: true });

      try {
        // url 传输是 ASCII 编码，那么需要对 keyword 进行编码
        const res = await getSearchSuggestions(encodeURIComponent(keyword));
        if (requestId !== currentSearchRequsetId) {
          return;
        }
        const data: string[] = res || [];
        set({ suggestions: data})
        // get().addHistory(keyword.trim());
      } catch (err) {
        console.log(err);
        set({ suggestions: [] });
      } finally {
        set({ loading: false });
      }
    },
    addHistory: (keyword: string) => {
      const trimedKeyword = keyword.trim();
      if (!trimedKeyword) {
        return;
      }
      const { history } = get();
      const exists = history.includes(trimedKeyword);

      // 已经存在的话，就把它放到最前面
      let newHistory = exists ? [trimedKeyword, ...history.filter((val) => val !== trimedKeyword)]
       : [trimedKeyword, ...history];

      // 保留最新的 15 条
      if (newHistory.length > 15) {
        newHistory = newHistory.slice(0, 15);
      }
      
      set({ history: newHistory });
    },
    delete: (id: number) => {
      const { history } = get();
      set({
        history: history.filter((_, index) => index !== id)
      })
    },
    clearHistory: () => {
      set({ history: [] });
    }
  }),{
    name: "searchSuggestionsStore",
    partialize: (state) => ({history: state.history})
  })
)