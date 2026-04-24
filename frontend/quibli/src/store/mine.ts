import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAiAvatar } from '@/api/mine';
import {
  getLikePosts,
  getLikeQuestions,
  getFavoritePosts,
  getFavoriteQuestions,
} from '@/api/user';
import type { MineProfile, Post, Question } from '@/types';

type PagedPostsRes = { postItems?: Post[]; total?: number };
type PagedQuestionsRes = { questionItems?: Question[]; total?: number };

/** 「我的点赞 / 我的收藏」共用：双 Tab + 分页列表（不落 persist） */
export interface MineListFeedSlice {
  posts: Post[];
  questions: Question[];
  postsPage: number;
  questionsPage: number;
  hasMorePosts: boolean;
  hasMoreQuestions: boolean;
  loadingPosts: boolean;
  loadingQuestions: boolean;
  postsScrollY: number;
  questionsScrollY: number;
  activeTab: 'posts' | 'questions';
  fetchingPostsPage: number;
  fetchingQuestionsPage: number;
}

const emptyMineListFeed = (): MineListFeedSlice => ({
  posts: [],
  questions: [],
  postsPage: 1,
  questionsPage: 1,
  hasMorePosts: true,
  hasMoreQuestions: true,
  loadingPosts: false,
  loadingQuestions: false,
  postsScrollY: 0,
  questionsScrollY: 0,
  activeTab: 'posts',
  fetchingPostsPage: 0,
  fetchingQuestionsPage: 0,
});

interface MineStore {
  mineProfile: MineProfile;
  aiAvatar: () => Promise<void>;

  likesFeed: MineListFeedSlice;
  setLikesActiveTab: (tab: 'posts' | 'questions') => void;
  setLikesPostsScrollY: (y: number) => void;
  setLikesQuestionsScrollY: (y: number) => void;
  loadMoreLikesPosts: (userId: number) => Promise<void>;
  loadMoreLikesQuestions: (userId: number) => Promise<void>;
  ensureLikesInitialFetch: (userId: number) => void;

  favoritesFeed: MineListFeedSlice;
  setFavoritesActiveTab: (tab: 'posts' | 'questions') => void;
  setFavoritesPostsScrollY: (y: number) => void;
  setFavoritesQuestionsScrollY: (y: number) => void;
  loadMoreFavoritesPosts: (userId: number) => Promise<void>;
  loadMoreFavoritesQuestions: (userId: number) => Promise<void>;
  ensureFavoritesInitialFetch: (userId: number) => void;
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
        const avatar = (await getAiAvatar(nickname)) as unknown as string;
        set({
          mineProfile: {
            ...get().mineProfile,
            user: {
              ...get().mineProfile.user,
              avatar,
            },
          },
        });
      },

      likesFeed: emptyMineListFeed(),
      setLikesActiveTab: (activeTab) =>
        set({ likesFeed: { ...get().likesFeed, activeTab } }),
      setLikesPostsScrollY: (postsScrollY) =>
        set({ likesFeed: { ...get().likesFeed, postsScrollY } }),
      setLikesQuestionsScrollY: (questionsScrollY) =>
        set({ likesFeed: { ...get().likesFeed, questionsScrollY } }),

      loadMoreLikesPosts: async (userId) => {
        if (!userId) return;
        const f = get().likesFeed;
        if (f.loadingPosts || !f.hasMorePosts || f.fetchingPostsPage === f.postsPage) return;
        set({ likesFeed: { ...f, loadingPosts: true, fetchingPostsPage: f.postsPage } });
        try {
          const res = (await getLikePosts(userId, f.postsPage, 10)) as PagedPostsRes;
          const newItems = res.postItems || [];
          const total = res.total || 0;
          const uniqueItems = newItems.filter((newItem: Post) =>
            !f.posts.some((oldItem) => oldItem.id === newItem.id)
          );
          const nextPosts = [...f.posts, ...uniqueItems];
          set({
            likesFeed: {
              ...get().likesFeed,
              posts: nextPosts,
              hasMorePosts: nextPosts.length < total,
              postsPage: f.postsPage + 1,
            },
          });
        } finally {
          set({
            likesFeed: { ...get().likesFeed, loadingPosts: false, fetchingPostsPage: 0 },
          });
        }
      },

      loadMoreLikesQuestions: async (userId) => {
        if (!userId) return;
        const f = get().likesFeed;
        if (
          f.loadingQuestions ||
          !f.hasMoreQuestions ||
          f.fetchingQuestionsPage === f.questionsPage
        )
          return;
        set({
          likesFeed: { ...f, loadingQuestions: true, fetchingQuestionsPage: f.questionsPage },
        });
        try {
          const res = (await getLikeQuestions(userId, f.questionsPage, 10)) as PagedQuestionsRes;
          const newItems = res.questionItems || [];
          const total = res.total || 0;
          const uniqueItems = newItems.filter((newItem: Question) =>
            !f.questions.some((oldItem) => oldItem.id === newItem.id)
          );
          const nextQuestions = [...f.questions, ...uniqueItems];
          set({
            likesFeed: {
              ...get().likesFeed,
              questions: nextQuestions,
              hasMoreQuestions: nextQuestions.length < total,
              questionsPage: f.questionsPage + 1,
            },
          });
        } finally {
          set({
            likesFeed: {
              ...get().likesFeed,
              loadingQuestions: false,
              fetchingQuestionsPage: 0,
            },
          });
        }
      },

      ensureLikesInitialFetch: (userId) => {
        if (!userId) return;
        const { likesFeed, loadMoreLikesPosts, loadMoreLikesQuestions } = get();
        if (likesFeed.posts.length === 0) void loadMoreLikesPosts(userId);
        if (likesFeed.questions.length === 0) void loadMoreLikesQuestions(userId);
      },

      favoritesFeed: emptyMineListFeed(),
      setFavoritesActiveTab: (activeTab) =>
        set({ favoritesFeed: { ...get().favoritesFeed, activeTab } }),
      setFavoritesPostsScrollY: (postsScrollY) =>
        set({ favoritesFeed: { ...get().favoritesFeed, postsScrollY } }),
      setFavoritesQuestionsScrollY: (questionsScrollY) =>
        set({ favoritesFeed: { ...get().favoritesFeed, questionsScrollY } }),

      loadMoreFavoritesPosts: async (userId) => {
        if (!userId) return;
        const f = get().favoritesFeed;
        if (f.loadingPosts || !f.hasMorePosts || f.fetchingPostsPage === f.postsPage) return;
        set({
          favoritesFeed: { ...f, loadingPosts: true, fetchingPostsPage: f.postsPage },
        });
        try {
          const res = (await getFavoritePosts(userId, f.postsPage, 10)) as PagedPostsRes;
          const newItems = res.postItems || [];
          const total = res.total || 0;
          const uniqueItems = newItems.filter((newItem: Post) =>
            !f.posts.some((oldItem) => oldItem.id === newItem.id)
          );
          const nextPosts = [...f.posts, ...uniqueItems];
          set({
            favoritesFeed: {
              ...get().favoritesFeed,
              posts: nextPosts,
              hasMorePosts: nextPosts.length < total,
              postsPage: f.postsPage + 1,
            },
          });
        } finally {
          set({
            favoritesFeed: {
              ...get().favoritesFeed,
              loadingPosts: false,
              fetchingPostsPage: 0,
            },
          });
        }
      },

      loadMoreFavoritesQuestions: async (userId) => {
        if (!userId) return;
        const f = get().favoritesFeed;
        if (
          f.loadingQuestions ||
          !f.hasMoreQuestions ||
          f.fetchingQuestionsPage === f.questionsPage
        )
          return;
        set({
          favoritesFeed: {
            ...f,
            loadingQuestions: true,
            fetchingQuestionsPage: f.questionsPage,
          },
        });
        try {
          const res = (await getFavoriteQuestions(userId, f.questionsPage, 10)) as PagedQuestionsRes;
          const newItems = res.questionItems || [];
          const total = res.total || 0;
          const uniqueItems = newItems.filter((newItem: Question) =>
            !f.questions.some((oldItem) => oldItem.id === newItem.id)
          );
          const nextQuestions = [...f.questions, ...uniqueItems];
          set({
            favoritesFeed: {
              ...get().favoritesFeed,
              questions: nextQuestions,
              hasMoreQuestions: nextQuestions.length < total,
              questionsPage: f.questionsPage + 1,
            },
          });
        } finally {
          set({
            favoritesFeed: {
              ...get().favoritesFeed,
              loadingQuestions: false,
              fetchingQuestionsPage: 0,
            },
          });
        }
      },

      ensureFavoritesInitialFetch: (userId) => {
        if (!userId) return;
        const { favoritesFeed, loadMoreFavoritesPosts, loadMoreFavoritesQuestions } = get();
        if (favoritesFeed.posts.length === 0) void loadMoreFavoritesPosts(userId);
        if (favoritesFeed.questions.length === 0) void loadMoreFavoritesQuestions(userId);
      },
    }),
    {
      name: 'mine-store',
      partialize: (state) => ({ mineProfile: state.mineProfile }),
    }
  )
);
