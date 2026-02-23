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


// 用户个人主页以及他人主页拿到收藏的文章
export const getFavoritePosts = async (userId: number, page: number, limit: number) => {
  const res = await axios.get('/user/getFavoritePosts', {
    params: {
      userId,
      page,
      limit,
    }
  })
  console.log("user.ts:getFavoritePosts:", res);
  return res;
}

export const getFavoriteQuestions = async (userId: number, page: number, limit: number) => {
  const res = await axios.get('/user/getFavoriteQuestions', {
    params: {
      userId,
      page,
      limit,
    }
  })
  // console.log("user.ts:getFavoriteQuestions:", res);
  return res;
}


export const getLikePosts = async (userId: number, page: number, limit: number) => {
  const res = await axios.get('/user/getLikePosts', {
    params: {
      userId,
      page,
      limit,
    }
  })
  return res;
}

export const getLikeQuestions = async (userId: number, page: number, limit: number) => {
  const res = await axios.get('/user/getLikeQuestions', {
    params: {
      userId,
      page,
      limit,
    }
  })
  return res;
}


export const getUserPosts = async (userId: number, page: number, limit: number) => {
  const res = await axios.get(`/user/${userId}/getUserPosts`, {
    params: { page, limit }
  });
  return res;
}

export const getUserQuestions = async (userId: number, page: number, limit: number) => {
  const res = await axios.get(`/user/${userId}/getUserQuestions`, {
    params: { page, limit }
  });
  return res;
}



// 获取关注的用户
// 获取指定用户关注的人
export const getFollowedUsers = async (userId: number, page?: number, limit?: number) => {
  const res = await axios.get(`/user/${userId}/following`, {
    params: { page, limit }
  });
  return res;
}

// 获取指定用户的粉丝
export const getFollowers = async (userId: number, page?: number, limit?: number) => {
  const res = await axios.get(`/user/${userId}/followers`, {
    params: { page, limit }
  });
  return res;
}

export const getFollowedPosts = async (page: number, limit: number) => {
  const res = await axios.get('/user/following/posts', { params: { page, limit } });
  return res;
}

export const getFollowedQuestions = async (page: number, limit: number) => {
  const res = await axios.get('/user/following/questions', { params: { page, limit } });
  return res;
}
