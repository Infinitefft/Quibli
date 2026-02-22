import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getPostDetails, getPostComments } from '@/api/post'
import { useSearchParams } from 'react-router-dom'
import CommentSection from '@/components/CommentSection'
import type { Post } from '@/types'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams();
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const [postRes, commentRes] = await Promise.all([
          getPostDetails(Number(id)),
          getPostComments(Number(id))
        ])
        setPost(postRes)
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
    // 1. 优先检查是否有明确指定的来源 URL (比如带参数的搜索页)
    if (location.state?.fromUrl) {
      navigate(location.state.fromUrl);
    } 
    // 2. 如果没有明确来源，说明是普通跳转，直接回退一级
    // 这样你在首页进来的，就会回到首页；个人中心进来的，就会回到个人中心
    else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } 
    // 3. 实在没有历史了，才去首页保底
    else {
      navigate('/', { replace: true });
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto p-20 text-center text-gray-300 tracking-widest text-xs">LOADING...</div>
  if (!post) return <div className="max-w-2xl mx-auto p-20 text-center text-gray-400 border border-dashed m-10">POST NOT FOUND</div>

  return (
    <div className="bg-white min-h-screen pb-32">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-50 px-4">
        <div className="max-w-3xl mx-auto h-16 flex items-center">
          <button 
            onClick={handleBack}
            className="flex items-center gap-1 text-gray-900 hover:opacity-60 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-10">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug mb-8">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {post.user.avatar ? (
                <img src={post.user.avatar} className="w-10 h-10 rounded-full object-cover bg-gray-50 border border-gray-100" alt="" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
                  {post.user.nickname?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-gray-900">{post.user.nickname}</span>
                  <button className="px-3 py-0.5 border border-blue-500 text-blue-500 rounded-full text-[11px] font-bold hover:bg-blue-50 transition-colors">
                    + 关注
                  </button>
                </div>
                <span className="text-[12px] text-gray-400 mt-0.5">
                  {new Date(post.publishedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </header>

        <article className="text-[#262626] text-[17px] leading-[1.85] whitespace-pre-wrap break-words mb-16">
          {post.content}
        </article>

        <div className="flex flex-wrap gap-2 mb-20">
          {post.tags.map(tag => (
            <span key={tag} className="px-3 py-1 text-[12px] text-gray-500 bg-gray-50 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        <CommentSection 
          comments={comments}
          total={post.totalComments} 
        />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex-1 bg-gray-100 rounded-full px-5 py-2.5 text-sm text-gray-400 mr-8 cursor-pointer hover:bg-gray-200/60 transition-colors">
            写下你的评论...
          </div>
          
          <div className="flex items-center gap-8">
            <button className="flex flex-col items-center group transition-colors hover:text-red-500 text-gray-400">
              <svg className="w-6 h-6 transition-all group-active:scale-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-[10px] font-bold mt-0.5 text-gray-500 group-hover:text-red-500 tabular-nums">{post.totalLikes}</span>
            </button>

            <button className="flex flex-col items-center group transition-colors hover:text-yellow-500 text-gray-400">
              <svg className="w-6 h-6 transition-all group-active:scale-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-[10px] font-bold mt-0.5 text-gray-500 group-hover:text-yellow-500 tabular-nums">{post.totalFavorites}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}