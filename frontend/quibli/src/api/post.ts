import axios from '@/api/config';
import type { Post } from '@/types/index';


export const fetchPosts = async (page: number = 1, limit: number = 10) => {
  try {
    const res = await axios.get('/posts', {
      params: {
        page,
        limit
      }
    });
    // console.log("fetchPosts的res:", res);
    return res;
  } catch(err) {
    console.log(err);
    return null;
  }
}


export const publishPosts = async (data:Partial<Post>) => {
  try {
    const res = await axios.post('/posts/publish', data);
    console.log("req.data:", data);
    return res;
  } catch(err) {
    console.log(err);
    return null;
  }
}


export const getPostDetails = async (id: number) => {
  const res = await axios.get(`/posts/${id}`);
  // console.log(res);
  return res;
}


export const getPostComments = async (id: number, page: number = 1, limit: number = 10) => {
  try {
    const res = await axios.get(`/posts/${id}/comments`, {
      params: {
        page,
        limit
      }
    });
    return res;
  } catch (err) {
    console.log(err);
    return []; // 评论出错返回空数组，防止前端 map 报错
  }
}