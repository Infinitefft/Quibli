import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Question } from '@/types/index';
import { MessageSquare, Star } from 'lucide-react';

interface QuestionsItemProps {
  question: Question;
  onClick?: () => void;
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const now = new Date();
    const isSameYear = date.getFullYear() === now.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return isSameYear ? `${month}-${day}` : `${date.getFullYear()}-${month}-${day}`;
  } catch (e) {
    return dateString;
  }
};

const QuestionsItem: React.FC<QuestionsItemProps> = ({ question, onClick }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={onClick || (() => navigate(`/questions/${question.id}`))}
      className="bg-white mb-2 p-6 active:bg-gray-50 transition-colors border-b border-gray-50"
    >
      {/* 顶部：大头像(深蓝底白字) + 信息 | 右侧标签 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3 overflow-hidden flex-1 mr-4">
          {/* 头像：w-11, 背景色加深，文字纯白 */}
          <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 border border-blue-100 flex items-center justify-center bg-[#3B82F6]">
            {question.user.avatar ? (
              <img src={question.user.avatar} alt={question.user.nickname} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-lg font-bold">
                {question.user.nickname[0]?.toUpperCase()}
              </span>
            )}
          </div>
          
          <div className="flex flex-col">
            <span className="text-[16px] text-gray-800 font-bold truncate max-w-[150px]">
              {question.user.nickname}
            </span>
            <span className="text-[12px] text-gray-400 font-normal">{formatDate(question.publishedAt)}</span>
          </div>
        </div>

        {/* 右侧标签：最多3个 */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          {question.tags?.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="text-[11px] text-gray-400 bg-gray-100/60 px-2 py-0.5 rounded-sm truncate max-w-[70px]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 中部：18px 醒目标题 */}
      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-gray-900 leading-[1.6] line-clamp-2">
          {question.title}
        </h2>
      </div>

      {/* 底部：交互区 (文字14px, 三角形21x16) */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center text-gray-500 space-x-2 active:scale-90 transition-transform cursor-pointer">
          <svg 
            viewBox="0 0 24 24" 
            className="w-[21px] h-[16px]" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12.8 5.6c-.4-.6-1.2-.6-1.6 0l-8.4 12c-.4.6 0 1.4.8 1.4h16.8c.8 0 1.2-.8.8-1.4l-8.4-12z" />
          </svg>
          <span className="text-[14px] font-semibold">赞同 {question.totalLikes}</span>
        </div>

        <div className="flex items-center text-gray-500 space-x-2">
          <MessageSquare className="w-[19px] h-[19px] stroke-[2.2]" />
          <span className="text-[14px] font-semibold">{question.totalAnswers} 回答</span>
        </div>

        <div className="flex items-center text-gray-500 space-x-2">
          <Star className="w-[19px] h-[19px] stroke-[2.2]" />
          <span className="text-[14px] font-semibold">{question.totalFavorites}</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(QuestionsItem);