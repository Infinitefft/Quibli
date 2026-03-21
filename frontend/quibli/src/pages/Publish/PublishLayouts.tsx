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
      navigate('/'); 
    } catch (error: any) {
      alert(error.message || '发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-y-auto">
      <header 
        className="flex-shrink-0 flex items-end px-4 pb-4 border-b border-gray-100 bg-white z-50"
        style={{ 
          paddingTop: 'calc(env(safe-area-inset-top) + 35px)',
          minHeight: 'calc(env(safe-area-inset-top) + 95px)' 
        }}
      >
        <div className="w-full h-12 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* 返回按钮 */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)} 
              className="w-12 h-12 -ml-3 rounded-full hover:bg-gray-100 active:scale-90"
            >
              <ChevronLeft className="w-8 h-8 text-gray-900 stroke-[3px]" />
            </Button>
            
            {/* 标题 */}
            <h1 className="text-[22px] font-black text-gray-900 tracking-tight ml-1 leading-none">
              {pageTitle}
            </h1>
          </div>

          {/* 发布按钮 */}
          <Button
            onClick={handlePublish}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 h-8 text-sm font-medium transition-all active:scale-95 flex-shrink-0"
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
        </div>
      </header>

      <main className="flex-1 bg-white">
        {children}
      </main>
    </div>
  );
}