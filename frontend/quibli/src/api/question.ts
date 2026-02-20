import axios from '@/api/config';
import type { Question } from '@/types/index';

export const fetchQuestions = async (page: number = 1, limit: number = 12) => {
  try {
    const response = await axios.get('/questions', {
      params: {
        page,
        limit
      }
    });
    // console.log(response);
    return response;
  } catch(err) {
    console.log(err);
    return null;
  }
}


export const publishQuestions = async (data: Partial<Question>) => {
  try {
    const res = await axios.post('/questions/publish', data);
    return res;
  } catch(err) {
    console.log(err);
    return null; 
  }
}


export const getQuestionDetails = async (id: number) => {
  const res = axios.get(`/questions/${id}`);
  // console.log(res);
  return res;
}