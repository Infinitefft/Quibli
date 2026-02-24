import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Question } from '@/types/index';
import { MessageSquare, Star } from 'lucide-react';
import { useUserStore } from '@/store/user'; // 导入 store

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
  
  // 获取 Store 中的方法和当前状态
  const { user, likeQuestion, favoriteQuestion, isLogin } = useUserStore();

  // 判断当前用户是否已经点赞或收藏
  const isLiked = user?.likeQuestions?.includes(question.id) || false;
  const isFavorited = user?.favoriteQuestions?.includes(question.id) || false;

  // 处理点赞点击
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止触发卡片跳转
    if (!isLogin) return navigate('/login');
    await likeQuestion(question.id);
  };

  // 处理收藏点击
  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止触发卡片跳转
    if (!isLogin) return navigate('/login');
    await favoriteQuestion(question.id);
  };

  // 计算显示的数值 (因为 props 是静态的，这里做简单的 UI 补偿展示)
  const displayLikes = isLiked ? question.totalLikes + (isLiked ? 0 : 1) : question.totalLikes;

  return (
    <div 
      onClick={onClick || (() => navigate(`/questions/${question.id}`))}
      className="bg-white mb-2 p-6 active:bg-gray-50 transition-colors border-b border-gray-50"
    >
      {/* 顶部：头像与标签 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3 overflow-hidden flex-1 mr-4">
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

      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-gray-900 leading-[1.6] line-clamp-2">
          {question.title}
        </h2>
      </div>

      {/* 底部：交互区 */}
      <div className="flex items-center space-x-8">
        {/* 点赞按钮 */}
        <div 
          onClick={handleLike}
          className={`flex items-center space-x-2 active:scale-90 transition-all cursor-pointer ${isLiked ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <svg 
            viewBox="0 0 24 24" 
            className="w-[21px] h-[16px]" 
            fill={isLiked ? "currentColor" : "none"} 
            stroke="currentColor" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12.8 5.6c-.4-.6-1.2-.6-1.6 0l-8.4 12c-.4.6 0 1.4.8 1.4h16.8c.8 0 1.2-.8.8-1.4l-8.4-12z" />
          </svg>
          <span className="text-[14px] font-semibold">
            {isLiked ? '已赞同' : '赞同'} {question.totalLikes}
          </span>
        </div>

        {/* 回答数 (保持原样) */}
        <div className="flex items-center text-gray-500 space-x-2">
          <MessageSquare className="w-[19px] h-[19px] stroke-[2.2]" />
          <span className="text-[14px] font-semibold">{question.totalAnswers} 回答</span>
        </div>

        {/* 收藏按钮 */}
        <div 
          onClick={handleFavorite}
          className={`flex items-center space-x-2 active:scale-90 transition-all cursor-pointer ${isFavorited ? 'text-yellow-500' : 'text-gray-500'}`}
        >
          <Star 
            className={`w-[19px] h-[19px] stroke-[2.2] ${isFavorited ? 'fill-current' : ''}`} 
          />
          <span className="text-[14px] font-semibold">
            {isFavorited ? '已收藏' : question.totalFavorites}
          </span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(QuestionsItem);