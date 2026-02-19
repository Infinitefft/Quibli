import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircleQuestion, 
  FileEdit, 
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function Publish() {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);

  // 页面加载后立即触发动画
  useEffect(() => {
    const timer = setTimeout(() => setActive(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setActive(false);
    // 等动画结束再跳回上一页
    setTimeout(() => navigate(-1), 300);
  };

  const handleNavigate = (path: string) => {
    setActive(false);
    setTimeout(() => navigate(path), 300);
  };

  return (
    // 背景层：带有一点模糊和半透明黑
    <div className={`fixed inset-0 z-50 transition-colors duration-300 flex flex-col justify-end ${active ? 'bg-black/40' : 'bg-transparent'}`} onClick={handleClose}>
      
      {/* 抽屉主体：点击内容区域阻止冒泡，避免关闭 */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`
          w-full bg-white rounded-t-[32px] px-6 pt-2 pb-10 transition-transform duration-300 ease-out
          ${active ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* 顶部控制条（药丸形状，像真抽屉一样） */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              写点什么？ <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
            </h2>
            <p className="text-sm text-gray-400 font-medium mt-1">选择一种分享方式</p>
          </div>
          <button onClick={handleClose} className="p-2 bg-gray-100 rounded-full active:scale-90 transition-transform">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 选项区域 */}
        <div className="space-y-4">
          <div 
            onClick={() => handleNavigate('/publish/questions')}
            className="flex items-center justify-between p-5 bg-blue-50/50 border border-blue-100/50 rounded-3xl active:scale-[0.97] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-50 rounded-2xl">
                <MessageCircleQuestion className="w-7 h-7 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 text-lg">提个问题</span>
                <span className="text-xs text-gray-400 font-medium">快速获得社区解答</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>

          <div 
            onClick={() => handleNavigate('/publish/posts')}
            className="flex items-center justify-between p-5 bg-indigo-50/50 border border-indigo-100/50 rounded-3xl active:scale-[0.97] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-50 rounded-2xl">
                <FileEdit className="w-7 h-7 text-indigo-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 text-lg">写篇文章</span>
                <span className="text-xs text-gray-400 font-medium">分享深度思考</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>
        </div>
        
        {/* 底部占位符：确保内容不被导航栏挡住 */}
        <div className="h-[64px] shrink-0" />
      </div>

    </div>
  );
}