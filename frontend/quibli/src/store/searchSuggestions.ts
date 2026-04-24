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



// 模块作用域变量，记录当前请求的 AbortController 实例
let currentAbortController: AbortController | null = null;


export const useSearchSuggestionsStore = create<SearchSuggestionsState>()(
  persist((set, get) => ({
    loading: false,
    suggestions: [],
    history: [],
    searchSuggestions: async (keyword: string) => {
      if (currentAbortController) {   // 如果当前有正在的请求，先取消正在请求的那个
        currentAbortController.abort();
      }
      if (!keyword.trim()) {   // 搜索框没东西
        set({ suggestions: []});  // 搜索建议列表清空
        return 
      }

      currentAbortController = new AbortController();
      const signal = currentAbortController.signal;

      set({ loading: true });

      try {
        // url 传输是 ASCII 编码，那么需要对 keyword 进行编码
        const res = await getSearchSuggestions(encodeURIComponent(keyword), { signal });
        const data: string[] = res || [];
        set({ suggestions: data})
        // get().addHistory(keyword.trim());
      } catch (err: any) {
        // 如果是被abort 取消的请求，不需要清空
        // 因为新的请求正在进行中
        if (err.name === 'CanceledError' || err.message === 'canceled') {
          console.log('请求被取消', keyword);
          return;
        }
        console.log(err);
        set({ suggestions: [] });
      } finally {
        // 只有当前请求没有被取消时才关闭 loading
        // 如果 signal.aborted 为 true 时说明有新请求覆盖了它，loading 应该保持为 true
        // set({ loading: false });
        // signal.aborted === true: 被取消了
        if (!signal.aborted) {  // 没有被取消，请求成功了，设置loading: false
          set({ loading: false });
          currentAbortController = null;  // 并且将全局的那个置为 null
        }
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