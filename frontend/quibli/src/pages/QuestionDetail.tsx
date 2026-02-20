import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getQuestionDetails, getQuestionComments } from '@/api/question'
import CommentSection from '@/components/CommentSection'
import type { Question } from '@/types'

export default function QuestionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [question, setQuestion] = useState<Question | null>(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

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
      {/* 极简顶部导航 */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 h-14 flex items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 text-gray-400 hover:text-black transition-colors group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </nav>

      <div className="px-5 md:px-8">
        {/* 用户信息与精致关注气泡 */}
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
                <button className="px-2.5 py-0.5 border border-blue-500 text-blue-500 rounded-full text-[10px] font-bold hover:bg-blue-50 transition-colors">
                  + 关注
                </button>
              </div>
              <span className="text-[11px] text-gray-400 mt-0.5">
                提问于 {new Date(question.publishedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* 标题 */}
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug mb-6 tracking-tight">
          {question.title}
        </h1>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {question.tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 text-[11px] font-medium text-gray-400 bg-gray-50 rounded-md">
              #{tag}
            </span>
          ))}
        </div>

        {/* 统计线条 */}
        <div className="flex items-center gap-6 border-y border-gray-50 py-3 mb-10 text-[13px] text-gray-500">
          <div className="flex items-center gap-1">
            <span className="font-bold text-gray-900 tabular-nums">{question.totalLikes}</span> 赞同
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-gray-900 tabular-nums">{question.totalFavorites}</span> 收藏
          </div>
          <div className="ml-auto text-gray-400">{question.totalAnswers} 回答</div>
        </div>

        <CommentSection 
          comments={comments} 
          total={question.totalAnswers} 
        />
      </div>

      {/* 底部精简工具栏 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 py-3 z-30">
        <div className="max-w-3xl mx-auto px-5 flex items-center justify-between gap-4">
          <div className="flex-1 bg-gray-100/80 rounded-full px-4 py-1.5 text-[13px] text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors border border-transparent">
            写下回答...
          </div>
          
          <div className="flex items-center gap-5">
            {/* 赞同 */}
            <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors group">
              <svg className="w-5 h-5 group-active:scale-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.705l1.38-9a2 2 0 00-2-2.295H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
              </svg>
              <span className="text-xs font-bold tabular-nums">{question.totalLikes}</span>
            </button>

            {/* 收藏 */}
            <button className="flex items-center gap-1.5 text-gray-500 hover:text-yellow-500 transition-colors group">
              <svg className="w-5 h-5 group-active:scale-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-xs font-bold tabular-nums">{question.totalFavorites}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}