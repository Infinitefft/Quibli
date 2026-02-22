import { create } from "zustand";
import { persist } from 'zustand/middleware';


import type { User } from '@/types/index';
import type { Credential } from '@/types/index';
import { doLogin, doRegister, followUser } from '@/api/user';
import type { RegisterCredentil } from '@/types/index';



interface UserStore {
  user: User | null;
  isLogin: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: (credentials: Credential) => void;
  register: (credentials: RegisterCredentil) => void;
  logout: () => void;
  follow: (userId: number) => Promise<void>
}

export const useUserStore = create<UserStore>() (
  persist((set, get) => ({
    user: null,
    isLogin: false,
    accessToken: null,
    refreshToken: null,
    login: async (credentials) => { 
      const { phone, password } = credentials;
      const res: any = await doLogin({ phone, password });
      // console.log("Login.tsx: res:", res.user);
      set({
        user: {
          ...res.user,
          following: res.user.following || [],
          likedPosts: res.user.likedPosts || [],
          collectPosts: res.user.collectPosts || [],
        },
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
        isLogin: true,
      })
    },
    register: async (credentials) => {
      const { phone, nickname, password } = credentials;
      // const res = await doRegister({ phone, nickname, password });
      await doRegister({ phone, nickname, password });
      // console.log("Register.tsx: res:", res);
    },
    logout: () => {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isLogin: false,
      })
    },
    // 乐观更新关注列表
    follow: async (targetFollowId: number) => {
      const { user } = get();
      if (!user) return;

      // 1. 这里的 || [] 就是为了兼容那些没有这些字段的旧 User 数据
      const oldFollowing = user.following || [];
      const isFollowed = oldFollowing.includes(targetFollowId);

      // 2. 乐观更新
      const newFollowing = isFollowed   // 如果已关注
        ? oldFollowing.filter(id => id !== targetFollowId)  // 取消关注
        : [...oldFollowing, targetFollowId];  // 否则添加到关注列表

      // 更新 Store
      set({ 
        user: { 
          ...user, 
          following: newFollowing 
        } 
      });
      try {
        await followUser(targetFollowId);
      } catch (error) {
        // 失败回滚
        set({ user: { ...user, following: oldFollowing } });
      }
    },
  }),
  {
    name: 'quibli-user-store',
    partialize: (state) => ({
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      isLogin: state.isLogin,
    })
  })
)