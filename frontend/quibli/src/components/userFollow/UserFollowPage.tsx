import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useUserStore } from '@/store/user';

interface Props {
  children: React.ReactNode;
}

export default function UserFollowPage({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { userId: paramsUserId } = useParams<{ userId: string }>();
  const { user } = useUserStore();

  const listType = (searchParams.get('type') as 'following' | 'followers') || 'following';
  const isMe = String(user?.id) === String(paramsUserId);
  const fromUrl = location.state?.fromUrl;

  const prefix = isMe ? '我的' : 'TA的';
  const title = listType === 'following' ? `${prefix}关注` : `${prefix}粉丝`;

  const handleBack = () => {
    if (isMe) {
      navigate('/mine', { replace: true });
    } else if (fromUrl) {
      navigate(fromUrl, { replace: true });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col overflow-hidden">
      <header className="pt-12 pb-2 px-4 flex-shrink-0 bg-white border-b border-gray-100">
        <div className="h-10 flex items-center relative">
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