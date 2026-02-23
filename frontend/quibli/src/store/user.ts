import { create } from "zustand";
import { persist } from 'zustand/middleware';

import type { User, Credential, RegisterCredentil } from '@/types/index';

import { 
  doLogin, 
  doRegister, 
  followUser, 
  toggleLikePost, 
  toggleLikeQuestion, 
  toggleFavoritePost, 
  toggleFavoriteQuestion 
} from '@/api/user';

interface UserStore {
  user: User | null;
  isLogin: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: (credentials: Credential) => void;
  register: (credentials: RegisterCredentil) => void;
  logout: () => void;
  follow: (userId: number) => Promise<void>;
  likePost: (postId: number) => Promise<void>;
  likeQuestion: (questionId: number) => Promise<void>;
  favoritePost: (postId: number) => Promise<void>;
  favoriteQuestion: (questionId: number) => Promise<void>;
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
      
      set({
        user: {
          ...res.user,
          // 强制初始化，哪怕后端返回的是 null，这里也变空数组
          // 同步后端数据
          following: res.user.following || [],
          likePosts: res.user.likePosts || [],
          favoritePosts: res.user.favoritePosts || [],
          likeQuestions: res.user.likeQuestions || [],
          favoriteQuestions: res.user.favoriteQuestions || [],
          followingCount: res.user.followingCount || 0,
          followerCount: res.user.followerCount || 0,
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

      // 记录旧的关注数用于回滚
      const oldFollowingCount = (user as any).followingCount || 0;

      // 2. 乐观更新
      const newFollowing = isFollowed   // 如果已关注
        ? oldFollowing.filter(id => id !== targetFollowId)  // 取消关注
        : [...oldFollowing, targetFollowId];  // 否则添加到关注列表

      // 计算新的关注数
      const newFollowingCount = isFollowed 
        ? Math.max(0, oldFollowingCount - 1) 
        : oldFollowingCount + 1;

      // 更新 Store
      set({ 
        user: { 
          ...user, 
          following: newFollowing,
          followingCount: newFollowingCount // 新增关注数乐观更新
        } as any
      });
      try {
        await followUser(targetFollowId);
      } catch (error) {
        // 失败回滚
        set({ 
          user: { 
            ...user, 
            following: oldFollowing,
            followingCount: oldFollowingCount // 失败回滚关注数
          } as any
        });
      }
    },
    // 乐观更新点赞文章
    likePost: async (postId: number) => {
      const { user } = get();
      if (!user) return;

      // 1. 获取当前状态
      const oldLikes = user.likePosts || [];
      const isLiked = oldLikes.includes(postId);

      // 2. 计算新状态：已点赞则过滤掉，未点赞则添加
      const newLikes = isLiked 
        ? oldLikes.filter(id => id !== postId) 
        : [...oldLikes, postId];

      set({ user: { ...user, likePosts: newLikes } });
      try {
        await toggleLikePost(postId);
      } catch (error) {
        // 失败回滚
        set({ user: { ...user, likePosts: oldLikes } });
      }
    },
    // 乐观更新点赞问题
    likeQuestion: async (questionId: number) => {
      const { user } = get();
      if (!user) return;

      const oldLikes = user.likeQuestions || [];
      const isLiked = oldLikes.includes(questionId);

      const newLikes = isLiked 
        ? oldLikes.filter(id => id !== questionId) 
        : [...oldLikes, questionId];

      set({ user: { ...user, likeQuestions: newLikes } });
      try {
        await toggleLikeQuestion(questionId);
      } catch (error) {
        set({ user: { ...user, likeQuestions: oldLikes } });
      }
    },
    // 乐观更新收藏文章
    favoritePost: async (postId: number) => {
      const { user } = get();
      if (!user) return;

      const oldFavs = user.favoritePosts || [];
      const isFav = oldFavs.includes(postId);

      const newFavs = isFav 
        ? oldFavs.filter(id => id !== postId) 
        : [...oldFavs, postId];

      set({ user: { ...user, favoritePosts: newFavs } });
      try {
        await toggleFavoritePost(postId);
      } catch (error) {
        set({ user: { ...user, favoritePosts: oldFavs } });
      }
    },
    // 乐观更新收藏问题
    favoriteQuestion: async (questionId: number) => {
      const { user } = get();
      if (!user) return;

      const oldFavs = user.favoriteQuestions || [];
      const isFav = oldFavs.includes(questionId);

      const newFavs = isFav 
        ? oldFavs.filter(id => id !== questionId) 
        : [...oldFavs, questionId];

      set({ user: { ...user, favoriteQuestions: newFavs } });
      try {
        await toggleFavoriteQuestion(questionId);
      } catch (error) {
        set({ user: { ...user, favoriteQuestions: oldFavs } });
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