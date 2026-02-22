import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getQuestionDetails, getQuestionComments } from '@/api/question'
import CommentSection from '@/components/CommentSection';
import { useSearchParams } from 'react-router-dom';
import type { Question } from '@/types'
import { useUserStore } from '@/store/user' // 1. 引入 store

export default function QuestionDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams();
  const navigate = useNavigate()
  const location = useLocation()
  const [question, setQuestion] = useState<Question | null>(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  // 2. 注入 Store 状态与方法
  const { user, isLogin, likeQuestion, favoriteQuestion, follow } = useUserStore()

  // 3. 判定状态：点赞、收藏、是否为本人、是否已关注
  const isLiked = user?.likeQuestions?.includes(Number(id))
  const isFavorited = user?.favoriteQuestions?.includes(Number(id))
  const isFollowed = user?.following?.includes(question?.user.id || 0)
  const isSelf = user?.id === question?.user.id

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const [questionRes, commentRes] = await Promise.all([
          getQuestionDetails(Number(id)),
          getQuestionComments(Number(id))
        ])
        setQuestion(questionRes)
        setComments(commentRes)
      } catch (err) {
        console.error('加载详情失败:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleBack = () => {
    if (location.state?.fromUrl) {
      navigate(location.state.fromUrl);
    } 
    else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } 
    else {
      navigate('/', { replace: true });
    }
  };

  // 4. 交互处理函数
  const onLike = async () => {
    if (!isLogin) return navigate('/login')
    await likeQuestion(Number(id))
  }

  const onFavorite = async () => {
    if (!isLogin) return navigate('/login')
    await favoriteQuestion(Number(id))
  }

  const handleFollow = async () => {
    if (!isLogin) return navigate('/login')
    if (isSelf || !question) return
    await follow(question.user.id)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-5 h-5 border-2 border-gray-100 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )

  if (!question) return (
    <div className="max-w-2xl mx-auto p-20 text-center text-gray-400">
      Question not found
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto bg-white min-h-screen pb-24">
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 h-14 flex items-center">
        <button 
          onClick={handleBack} 
          className="p-2 -ml-2 text-gray-400 hover:text-black transition-colors group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </nav>

      <div className="px-5 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {question.user.avatar ? (
              <img src={question.user.avatar} className="w-9 h-9 rounded-full object-cover border border-gray-50 shadow-sm" alt="" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xs">
                {question.user.nickname?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-gray-900">{question.user.nickname}</span>
                {/* 关注按钮逻辑 */}
                {!isSelf && (
                  <button 
                    onClick={handleFollow}
                    className={`px-2.5 py-0.5 border rounded-full text-[10px] font-bold transition-colors ${
                      isFollowed 
                        ? 'border-gray-200 text-gray-400' 
                        : 'border-blue-500 text-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    {isFollowed ? '已关注' : '+ 关注'}
                  </button>
                )}
              </div>
              <span className="text-[11px] text-gray-400 mt-0.5">
                提问于 {new Date(question.publishedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug mb-6 tracking-tight">
          {question.title}
        </h1>

        <div className="flex flex-wrap gap-2 mb-8">
          {question.tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 text-[11px] font-medium text-gray-400 bg-gray-50 rounded-md">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-6 border-y border-gray-50 py-3 mb-10 text-[13px] text-gray-500">
          <div className="flex items-center gap-1">
            <span className={`font-bold tabular-nums ${isLiked ? 'text-blue-600' : 'text-gray-900'}`}>
              {isLiked ? question.totalLikes + 1 : question.totalLikes}
            </span> 赞同
          </div>
          <div className="flex items-center gap-1">
            <span className={`font-bold tabular-nums ${isFavorited ? 'text-yellow-500' : 'text-gray-900'}`}>
              {isFavorited ? '已' : ''}收藏
            </span>
          </div>
          <div className="ml-auto text-gray-400">{question.totalAnswers} 回答</div>
        </div>

        <CommentSection 
          comments={comments} 
          total={question.totalAnswers} 
        />
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 py-3 z-30">
        <div className="max-w-3xl mx-auto px-5 flex items-center justify-between gap-4">
          <div className="flex-1 bg-gray-100/80 rounded-full px-4 py-1.5 text-[13px] text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors border border-transparent">
            写下回答...
          </div>
          
          <div className="flex items-center gap-5">
            {/* 赞同按钮 */}
            <button 
              onClick={onLike}
              className={`flex items-center gap-1.5 transition-colors group ${isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
            >
              <svg className={`w-5 h-5 group-active:scale-90 transition-transform ${isLiked ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.705l1.38-9a2 2 0 00-2-2.295H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
              </svg>
              <span className="text-xs font-bold tabular-nums">{isLiked ? question.totalLikes + 1 : question.totalLikes}</span>
            </button>

            {/* 收藏按钮 */}
            <button 
              onClick={onFavorite}
              className={`flex items-center gap-1.5 transition-colors group ${isFavorited ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}
            >
              <svg className={`w-5 h-5 group-active:scale-90 transition-transform ${isFavorited ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-xs font-bold tabular-nums">{isFavorited ? '已收藏' : question.totalFavorites}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}