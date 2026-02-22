import axios from '@/api/config';
import type { Credential } from '@/types/index';
import type { RegisterCredentil } from '@/types/index';


// 用户登录请求
export const doLogin = async (userData: Credential) => {
  const res = await axios.post('/auth/login', userData);
  // console.log("user.ts:res:", res);
  return res;
}

// 用户注册
export const doRegister = async (registerData: RegisterCredentil) => {
  const res = await axios.post('/user/register', registerData);
  // console.log("user.ts:res:", res);
  return res;
}

// 用户关注
export const followUser = async (targetFollowId: number) => {
  await axios.post('/user/follow', {
    targetFollowId
  });
}

// 点赞/取消点赞文章
export const toggleLikePost = async (postId: number) => {
  return await axios.post('/user/like-post', { postId });
};

// 点赞/取消点赞问题
export const toggleLikeQuestion = async (questionId: number) => {
  return await axios.post('/user/like-question', { questionId });
};

// 收藏/取消收藏文章
export const toggleFavoritePost = async (postId: number) => {
  return await axios.post('/user/favorite-post', { postId });
};

// 收藏/取消收藏问题
export const toggleFavoriteQuestion = async (questionId: number) => {
  return await axios.post('/user/favorite-question', { questionId });
};