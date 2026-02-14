import { create } from "zustand";
import { persist } from 'zustand/middleware';


import type { User } from '@/types/index';
import type { Credential } from '@/types/index';
import { doLogin } from '@/api/user';


interface UserStore {
  user: User | null;
  isLogin: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: (credentials: Credential) => void;
}

export const useUserStore = create<UserStore>() (
  persist((set, get) => ({
    user: null,
    isLogin: false,
    accessToken: null,
    refreshToken: null,
    login: async (credentials) => {
      const { phone, password } = credentials;
      const res = await doLogin({ phone, password });
      set({
        user: res.user,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        isLogin: true,
      })
    }
  }),
  {
    name: 'quibli-user-store',
    partialize: (state) => ({
      user: state.user,
      accessToken: state.accessToken,
      // refreshToken: state.refreshToken,
      isLogin: state.isLogin,
    })
  })
)