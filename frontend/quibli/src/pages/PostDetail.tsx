import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPostDetails } from '@/api/post'
import type { Post } from '@/types'

export default function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const res = await getPostDetails(Number(id))
        setPost(res)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) return <div className="max-w-2xl mx-auto p-10 text-center text-gray-400">加载中...</div>
  if (!post) return <div className="max-w-2xl mx-auto p-10 text-center text-red-400">文章不见了</div>

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 bg-white min-h-screen">
      
      {/* 标题区域 */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-6">
        {post.title}
      </h1>

      {/* 用户与时间信息 */}
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
        {post.user.avatar ? (
          <img
            src={post.user.avatar}
            alt=""
            className="w-12 h-12 rounded-full object-cover border border-gray-100"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xl">
            {post.user.nickname?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{post.user.nickname}</span>
          <span className="text-xs text-gray-400">
            发布于 {new Date(post.publishedAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* 标签 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {post.tags.map(tag => (
          <span key={tag} className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
            #{tag}
          </span>
        ))}
      </div>

      {/* 正文内容 - 关键点：保留换行符 */}
      <div className="text-gray-700 text-lg leading-loose whitespace-pre-wrap break-words mb-12">
        {post.content}
      </div>

      {/* 底部交互操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 md:relative md:border-none md:p-0">
        <div className="max-w-3xl mx-auto flex items-center justify-around md:justify-start md:gap-8 text-gray-500">
          <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
            <span className="text-xl">👍</span>
            <span className="text-sm">{post.totalLikes || '赞'}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-yellow-500 transition-colors">
            <span className="text-xl">⭐</span>
            <span className="text-sm">{post.totalFavorites || '收藏'}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
            <span className="text-xl">💬</span>
            <span className="text-sm">{post.totalComments || '评论'}</span>
          </button>
        </div>
      </div>

    </div>
  )
}