import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/types';



export const useMineStore = create<UserProfile>()(
  persist(
    (set, get) => ({
      user: {
        id: 0,
        phone: '',
        nickname: '',
        avatar: undefined,
      },
      posts: [],
      questions: [],
    }),
    { 
      name: 'mine-store',
    }
  )
);
