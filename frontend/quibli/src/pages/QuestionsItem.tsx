import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Question } from '@/types/index';
import { MessageCircle, ThumbsUp, Star } from 'lucide-react';

interface QuestionsItemProps {
  question: Question;
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return dateString;
  }
};

const QuestionsItem: React.FC<QuestionsItemProps> = ({ question }) => {
  const navigate = useNavigate();

  return (
    <div 
        onClick={() => navigate(`questions/${question.id}`)} 
        className="bg-white mb-2 p-4 active:bg-gray-50 border-b border-gray-100 last:border-0"
    >
      {/* Row 1: Publisher Info (Avatar + Nickname) + Date */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                {question.user.avatar ? (
                    <img src={question.user.avatar} alt={question.user.nickname} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-600 text-[10px] font-bold">
                        {question.user.nickname[0].toUpperCase()}
                    </div>
                )}
            </div>
            <span className="text-sm text-gray-700 font-medium truncate max-w-[150px]">
                {question.user.nickname}
            </span>
        </div>
        <span className="text-xs text-gray-400 font-normal">
            {formatDate(question.publishedAt)}
        </span>
      </div>

      {/* Row 2: Question Title */}
      <div className="mb-3">
        <h2 className="text-[17px] font-bold text-gray-900 leading-snug line-clamp-3">
            {question.title}
        </h2>
      </div>

      {/* Row 3: Stats (Likes, Answers, Favorites) */}
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center text-gray-500 space-x-1.5">
                <ThumbsUp className="w-4 h-4 stroke-[2.5]" />
                <span className="text-xs font-semibold">{question.totalLikes}</span>
            </div>
            
            <div className="flex items-center text-gray-500 space-x-1.5">
                <MessageCircle className="w-4 h-4 stroke-[2.5]" />
                <span className="text-xs font-semibold">{question.totalAnswers}</span>
            </div>
            
            <div className="flex items-center text-gray-500 space-x-1.5">
                <Star className="w-4 h-4 stroke-[2.5]" />
                <span className="text-xs font-semibold">{question.totalFavorites}</span>
            </div>
          </div>

          {/* Optional: Show one tag if needed, or keep clean */}
          {question.tags.length > 0 && (
             <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                 {question.tags[0]}
             </span>
          )}
      </div>
    </div>
  );
}

export default React.memo(QuestionsItem);