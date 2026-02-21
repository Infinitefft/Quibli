import axios from '@/api/config';

export const getSearchSuggestions = async (keyword: string) => {
  const res = await axios.get(`/ai/getSearchSuggestions?keyword=${keyword}`);
  // console.log(res, "{[][][]}}{}{}");
  return res;
}


export const Search = async (keyword: string, type: 'post' | 'question' = 'post', page: number = 1, limit: number = 10) => {
  const res = await axios.get('/ai/search', {
    params: {
      keyword,
      type,
      page,
      limit,
    }
  })
  return res;
}


export const SearchUser = async (keyword: string, page: number = 1, limit: number = 10) => {
  const res = await axios.get('/user/search', {
    params: {
      keyword,
      page,
      limit,
    }
  })
  return res;
}