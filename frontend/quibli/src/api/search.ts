import axios from '@/api/config';

export const getSearchSuggestions = async (keyword: string) => {
  const res = await axios.get(`/search/getSearchSuggestions?keyword=${keyword}`);
  return res;
}