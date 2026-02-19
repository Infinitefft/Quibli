import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MineProfile } from '@/types';

interface MineStore {
  mineProfile: MineProfile,
}


export const useMineStore = create<MineStore>()(
  persist(
    (set, get) => ({
      mineProfile: {
        user: {
          id: 0,
          phone: '',
          nickname: '',
          avatar: undefined,
        },
        posts: [],
        questions: [],
        followers: [],
        following: [],
        likedPosts: [],
        favoritedPosts: [],
        likedQuestions: [],
        favoritedQuestions: [],
      },
    }),
    { 
      name: 'mine-store',
    }
  )
);
