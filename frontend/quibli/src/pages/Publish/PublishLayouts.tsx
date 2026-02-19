import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePublishStore } from '@/store/publish';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2, SendHorizontal } from 'lucide-react';

export default function PublishLayouts({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(false);

  const { submitQuestion, submitPost } = usePublishStore();

  // 根据当前路由路径判断业务类型
  const isQuestion = pathname.includes('/publish/questions');
  const pageTitle = isQuestion ? '提问' : '写文章';

  const handlePublish = async () => {
    setLoading(true);
    try {
      if (isQuestion) {
        await submitQuestion();
      } else {
        await submitPost();
      }
      // 发布成功后的跳转逻辑
      navigate('/'); 
    } catch (error: any) {
      // 捕获 store 抛出的校验错误（如分数不足）
      alert(error.message || '发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 统一头部控制栏 */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-gray-50 sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </Button>
          <h1 className="text-[16px] font-bold">{pageTitle}</h1>
        </div>

        <Button
          onClick={handlePublish}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 h-8 text-sm font-medium transition-all active:scale-95"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <div className="flex items-center gap-1">
              <SendHorizontal className="w-3.5 h-3.5" />
              <span>发布</span>
            </div>
          )}
        </Button>
      </header>

      {/* 页面内容区 */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}