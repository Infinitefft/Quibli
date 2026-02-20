import axios from '@/api/config';

export const getSearchSuggestions = async (keyword: string) => {
  const res = await axios.get(`/ai/getSearchSuggestions?keyword=${keyword}`);
  console.log(res, "{[][][]}}{}{}");
  return res;
}