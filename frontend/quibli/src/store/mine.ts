import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAiAvatar } from '@/api/mine';
import type { MineProfile } from '@/types';

interface MineStore {
  mineProfile: MineProfile,
  aiAvatar: () => Promise<void>;
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
      aiAvatar: async () => {
        const { nickname } = get().mineProfile.user;
        const avatar = await getAiAvatar(nickname);
        set({
          mineProfile: {
            ...get().mineProfile,
            user: {
              ...get().mineProfile.user,
              avatar,
            }
          }
        })
      }
    }),
    { 
      name: 'mine-store',
    }
  )
);
