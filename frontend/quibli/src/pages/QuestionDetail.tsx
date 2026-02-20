import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getQuestionDetails } from '@/api/question'

import type { Question } from '@/types'

export default function QuestionDetail() {
  const { id } = useParams()
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        const res = await getQuestionDetails(Number(id))
        setQuestion(res)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (!question) {
    return <div className="p-4">Question not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      
      {/* 用户信息 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {question.user.nickname?.[0]?.toUpperCase() || '?'}
        </div>
        
        <div>
          <div className="font-medium">
            {question.user.nickname || '用户'}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(question.publishedAt).toLocaleString()}
          </div>
        </div>
      </div>

      {/* 标题 */}
      <h1 className="text-xl font-semibold leading-relaxed">
        {question.title}
      </h1>

      {/* 标签 */}
      <div className="flex flex-wrap gap-2">
        {question.tags.map(tag => (
          <span
            key={tag}
            className="px-2 py-1 text-sm bg-gray-100 rounded"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* 统计 */}
      <div className="flex gap-6 text-sm text-gray-600 border-t pt-3">
        <span>👍 {question.totalLikes}</span>
        <span>⭐ {question.totalFavorites}</span>
        <span>💬 {question.totalAnswers}</span>
      </div>

    </div>
  )
}