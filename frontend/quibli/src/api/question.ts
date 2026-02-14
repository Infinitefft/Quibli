import axios from '@/api/config';

export const fetchQuestions = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await axios.get('/questions', {
      params: {
        page,
        limit
      }
    });
    console.log(response);
    return response;
  } catch(err) {
    console.log(err);
    return null;
  }
}