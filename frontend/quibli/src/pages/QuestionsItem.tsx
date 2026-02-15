import {
  useNavigate,
} from 'react-router-dom';

import type { Question } from '@/types/index';



export default function QuestionsCard({ question }: { question: Question }) {
  const navigate = useNavigate();


  return (
    <div onClick={() => navigate(`questions/${question.id}`)} className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2">{question.title}</h2>
      <p className="text-sm text-gray-300">By {question.user.nickname}</p>
      <p className="text-sm text-gray-300">Posted on {question.publishedAt}</p>
      <p className="text-sm text-gray-300">点赞数: {question.totalLikes}</p>
      <p className="text-sm text-gray-300">收藏数: {question.totalFavorites}</p>
      <p className="text-sm text-gray-300">评论数: {question.totalAnswers}</p>
      <p className="text-sm text-gray-300">Tags: {question.tags.join(', ')}</p> 
    </div>
  );
}


