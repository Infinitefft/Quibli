import axios from '@/api/config';

export const getAiAvatar = async (nickname: string) => {
  return axios.get(`/ai/avatar?nickname=${nickname}`);
}