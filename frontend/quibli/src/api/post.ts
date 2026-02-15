import axios from '@/api/config';

export const fetchPosts = async (page: number = 1, limit: number = 10) => {
  try {
    const res = await axios.get('/posts', {
      params: {
        page,
        limit
      }
    });
    console.log("fetchPosts的res:", res);
    return res;
  } catch(err) {
    console.log(err);
    return null;
  }
}