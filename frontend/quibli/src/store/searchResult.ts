import { create } from 'zustand';

interface SearchListState {
  list: any[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  initialized: boolean;
  scrollTop: number;
}

interface SearchResultStore {
  keyword: string;
  activeTab: 'posts' | 'questions';
  
  postState: SearchListState;
  questionState: SearchListState;

  setKeyword: (keyword: string) => void;
  setActiveTab: (tab: 'posts' | 'questions') => void;
  
  setPostState: (state: Partial<SearchListState> | ((prev: SearchListState) => Partial<SearchListState>)) => void;
  setQuestionState: (state: Partial<SearchListState> | ((prev: SearchListState) => Partial<SearchListState>)) => void;
  
  reset: () => void;
}

const initialListState: SearchListState = {
  list: [],
  page: 1,
  hasMore: true,
  loading: false,
  initialized: false,
  scrollTop: 0,
};

export const useSearchResultStore = create<SearchResultStore>((set) => ({
  keyword: '',
  activeTab: 'posts',
  postState: initialListState,
  questionState: initialListState,

  setKeyword: (keyword) => set({ keyword }),
  setActiveTab: (activeTab) => set({ activeTab }),

  setPostState: (updater) => set((state) => ({
    postState: { ...state.postState, ...(typeof updater === 'function' ? updater(state.postState) : updater) }
  })),

  setQuestionState: (updater) => set((state) => ({
    questionState: { ...state.questionState, ...(typeof updater === 'function' ? updater(state.questionState) : updater) }
  })),

  reset: () => set({
    keyword: '',
    activeTab: 'posts',
    postState: initialListState,
    questionState: initialListState
  })
}));