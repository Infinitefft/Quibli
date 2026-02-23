import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useUserStore } from '@/store/user';

interface Props {
  type: 'posts' | 'questions';
  children: React.ReactNode;
}

export default function UserPublishPage({ type, children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId: paramsUserId } = useParams<{ userId: string }>();
  const { user } = useUserStore();

  const isMe = String(user?.id) === String(paramsUserId);
  const prefix = isMe ? '我的' : 'TA的';
  const title = type === 'posts' ? `${prefix}文章` : `${prefix}提问`;

  const handleBack = () => {
    const fromUrl = location.state?.fromUrl;
    if (fromUrl) {
      // 如果有来源，直接跳回去，使用 replace: true 避免返回路径在历史栈里堆叠
      navigate(fromUrl, { replace: true });
    } else {
      // 如果是用户直接输入 URL 进来的，没有 state，就后退一步
      navigate(-1);
    }
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col overflow-hidden">
      <header className="pt-12 pb-2 px-4 flex-shrink-0 bg-white border-b border-gray-100">
        <div className="h-10 flex items-center relative">
          {/* 使用自定义的 handleBack */}
          <button 
            onClick={handleBack} 
            className="p-2 -ml-2 active:scale-90 transition-transform z-10"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          
          <h1 className="absolute inset-0 flex items-center justify-center text-[17px] font-bold text-gray-900 pointer-events-none">
            {title}
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}