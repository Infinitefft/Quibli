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
    const res = await axios.post('/questions/publish', data);
    return res;
  } catch(err) {
    console.log(err);
    return null;
  }
}