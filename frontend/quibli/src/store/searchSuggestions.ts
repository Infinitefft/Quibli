import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSearchSuggestions } from '@/api/search';


interface SearchSuggestionsState {
  loading: boolean;
  suggestions: string[];
  history: string[];
  search: (keyword: string) => Promise<void>;
  addHistory: (keyword: string) => void;
  clearHistory: () => void;
}


export const useSearchSuggestionsStore = create<SearchSuggestionsState>()(
  persist((set, get) => ({
    loading: false,
    suggestions: [],
    history: [],
    search: async (keyword: string) => {
      if (!keyword.trim()) {   // 搜索框没东西
        set({ suggestions: []});  // 搜索建议列表清空
        return 
      }

      set({ loading: true });

      try {
        // url 传输是 ASCII 编码，那么需要对 keyword 进行编码
        const res = await getSearchSuggestions(encodeURIComponent(keyword));
        const data: [] = res.data || [];
        set({ suggestions: data})
        get().addHistory(keyword.trim());
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
      let newHistory = exists ? [trimedKeyword, ...history.filter((val) => val !== trimedKeyword)]
       : [trimedKeyword, ...history];
      set({ history: newHistory });
    },
    clearHistory: () => {
      set({ history: [] });
    }
  }),{
    name: "searchSuggestionsStore",
    partialize: (state) => ({history: state.history})
  })
)