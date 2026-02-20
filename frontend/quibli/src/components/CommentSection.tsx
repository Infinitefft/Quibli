interface CommentSectionProps {
  comments: any[]
  total: number
}

export default function CommentSection({ comments, total }: CommentSectionProps) {
  return (
    <div className="mt-16 border-t border-gray-100 pt-10 pb-24 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          全部评论 <span className="ml-2 text-sm font-medium text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">{total}</span>
        </h3>
      </div>

      <div className="space-y-10">
        {comments.map((comment) => (
          <div key={comment.id} className="group transition-all duration-300">
            {/* 一级评论 */}
            <div className="flex gap-4">
              {/* 头像部分 */}
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center font-semibold text-gray-600 overflow-hidden shadow-sm">
                  {comment.user.avatar ? (
                    <img src={comment.user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    comment.user.nickname?.[0]
                  )}
                </div>
              </div>

              {/* 内容部分 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[15px] font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">
                    {comment.user.nickname}
                  </span>
                  <span className="text-xs text-gray-400">刚刚</span> {/* 示例占位 */}
                </div>
                
                <div className="text-[15px] leading-relaxed text-gray-700 break-words">
                  {comment.content}
                </div>

                {/* 交互按钮 */}
                <div className="flex items-center gap-4 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-xs font-medium text-gray-500 hover:text-blue-600">回复</button>
                  <button className="text-xs font-medium text-gray-500 hover:text-red-500">点赞</button>
                </div>
                
                {/* 平铺的子回复 */}
                {comment.replies?.length > 0 && (
                  <div className="mt-4 relative overflow-hidden">
                    {/* 装饰性左边线 */}
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-100 rounded-full" />
                    
                    <div className="pl-4 space-y-4">
                      {comment.replies.map((reply: any) => (
                        <div key={reply.id} className="group/reply">
                          <div className="flex items-start gap-2 text-[14px] leading-relaxed">
                            <span className="font-bold text-gray-900 shrink-0 hover:text-blue-600 cursor-pointer">
                              {reply.user.nickname}
                            </span>
                            
                            <div className="flex-1">
                              {reply.replyToUser && (
                                <span className="text-gray-400 mr-1.5 select-none">
                                  回复 <span className="text-blue-500 font-medium hover:underline cursor-pointer">@{reply.replyToUser}</span>
                                </span>
                              )}
                              <span className="text-gray-700">{reply.content}</span>
                              
                              <div className="mt-1 flex gap-3 opacity-0 group-hover/reply:opacity-100 transition-opacity">
                                <button className="text-[11px] text-gray-400 hover:text-blue-500">回复</button>
                                <span className="text-[11px] text-gray-300">刚刚</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}