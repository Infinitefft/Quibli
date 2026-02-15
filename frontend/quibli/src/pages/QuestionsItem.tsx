import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Question } from '@/types/index';
import { MessageCircleQuestion, ThumbsUp, Star } from 'lucide-react';

function QuestionsCard({ question }: { question: Question }) {
  const navigate = useNavigate();

  return (
    <div 
        onClick={() => navigate(`questions/${question.id}`)} 
        className="bg-white mb-2 p-4 active:bg-gray-50 border-b border-gray-100 last:border-0"
    >
      <div className="flex items-start">
        {/* Q Icon Badge */}
        <div className="flex-shrink-0 mr-3 mt-1">
            <div className="w-6 h-6 rounded bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                Q
            </div>
        </div>
        
        <div className="flex-1 min-w-0">
             <h2 className="text-base font-bold text-gray-900 mb-2 leading-snug">
                {question.title}
             </h2>
             
             <div className="flex flex-wrap gap-2 mb-3">
                 {question.tags.map(tag => (
                     <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                         {tag}
                     </span>
                 ))}
             </div>

             <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-3">
                    <span className="text-gray-500 font-medium">{question.user.nickname}</span>
                    <span>{question.publishedAt}</span>
                </div>
                
                <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {question.totalLikes}
                    </span>
                    <span className="flex items-center text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                        <MessageCircleQuestion className="w-3 h-3 mr-1" />
                        {question.totalAnswers} 回答
                    </span>
                    <span className="flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        {question.totalFavorites}
                    </span>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}

// Memoize the component
export default React.memo(QuestionsCard);