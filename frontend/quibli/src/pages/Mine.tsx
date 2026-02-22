import { useState } from 'react';
import { useUserStore } from '@/store/user';
import { useMineStore } from '@/store/mine';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import { 
  Camera, 
  Upload, 
  Sparkle, 
  LogOut, 
  ChevronRight, 
  GitBranch, 
  Database,
  ShoppingBag,
  FileText,
  MessageCircleQuestion,
  Star,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Simple loading component (defined inline to ensure availability)
const Loading = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
  </div>
);

// Reusable Menu Item Component with Glassmorphism
const MenuRow = ({ icon: Icon, title, subTitle, onClick, iconColor, iconBg }: { 
  icon: any, 
  title: string, 
  subTitle?: string,
  onClick: () => void, 
  iconColor: string, 
  iconBg: string 
}) => (
  <div 
    onClick={onClick}
    className="group flex items-center justify-between p-4 mb-3 bg-white/70 backdrop-blur-md border border-white/60 shadow-sm rounded-2xl cursor-pointer hover:bg-white/90 hover:shadow-md transition-all duration-200 active:scale-[0.98]"
  >
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-gray-800 text-[15px]">{title}</span>
        {subTitle && <span className="text-[11px] text-gray-400 font-medium">{subTitle}</span>}
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
  </div>
);

export default function Mine() {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const { aiAvatar } = useMineStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = async (type: string) => {
    setOpen(false);
    if (type === 'ai') {
      setLoading(true);
      await aiAvatar();
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setTimeout(() => {
      logout();
      navigate('/');
    }, 100);
  };

  return (
    // 关键点 1: overscroll-none 禁用整个容器的橡皮筋效果
    <div className="h-screen w-full bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col relative overflow-hidden font-sans overscroll-none">
      
      {/* 1. 固定顶部区域 */}
      <div className="pt-6 pb-4 px-6 relative z-10 shrink-0">
        <div className="flex items-center gap-5">
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <div className="relative cursor-pointer group shrink-0">
                <div className="h-[88px] w-[88px] rounded-full p-1 bg-white shadow-lg shadow-indigo-100 transition-transform active:scale-95">
                  <Avatar className="h-full w-full rounded-full border border-gray-100">
                    <AvatarImage src={user?.avatar} className="object-cover" />
                    <AvatarFallback className="bg-indigo-50 text-indigo-600 text-2xl font-bold">
                      {user?.nickname?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute bottom-1 right-1 bg-indigo-500 rounded-full p-1.5 border-[3px] border-white shadow-sm">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </DrawerTrigger>

            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader className="text-left px-6">
                  <DrawerTitle className="text-xl font-bold text-gray-900">修改头像</DrawerTitle>
                  <DrawerDescription className="text-gray-500 mt-1">
                    选择一种方式更新您的个人头像
                  </DrawerDescription>
                </DrawerHeader>
                <div className="p-6 space-y-3">
                  <Button variant="outline" className="w-full justify-start h-14 text-base rounded-2xl hover:bg-gray-50 border-gray-200 text-gray-700"
                    onClick={() => handleAction('camera')}>
                    <Camera className="mr-3 h-5 w-5 text-blue-500" />
                    拍照
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-14 text-base rounded-2xl hover:bg-gray-50 border-gray-200 text-gray-700"
                    onClick={() => handleAction('upload')}>
                    <Upload className="mr-3 h-5 w-5 text-purple-500" />
                    从相册上传
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-14 text-base rounded-2xl
                    bg-gradient-to-r from-blue-600 to-indigo-600 border-none text-white hover:opacity-90 transition-opacity"
                    onClick={() => handleAction('ai')}>
                    <Sparkle className="mr-3 h-5 w-5 text-yellow-300" />
                    使用AI生成头像
                  </Button>
                </div>
                <DrawerFooter className="pt-2 px-6 pb-8">
                  <DrawerClose asChild>
                    <Button variant="ghost" className="w-full h-12 text-gray-500 font-normal hover:bg-gray-100 rounded-xl">取消</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>

          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{user?.nickname || '用户'}</h2>
            <div className="flex items-center mt-1.5 gap-2">
              <span className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                PRO
              </span>
              <p className="text-sm text-gray-400 font-medium tracking-wide">ID: {user?.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 可滚动的主体区域 */}
      {/* 关键点 2: touch-pan-y 允许垂直滑动但不允许触发浏览器的回弹逻辑 */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 overscroll-contain touch-pan-y">
        <div className="py-2">   
          <MenuRow 
            icon={FileText} 
            title="我的文章"
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            onClick={() => console.log('Articles')} 
          />

          <MenuRow 
            icon={MessageCircleQuestion} 
            title="我提的问题" 
            iconColor="text-violet-600"
            iconBg="bg-violet-50"
            onClick={() => console.log('Questions')} 
          />

          <MenuRow 
            icon={Star} 
            title="我的收藏" 
            iconColor="text-amber-500"
            iconBg="bg-amber-50"
            onClick={() => navigate('/minefavorites')}
          />

          <MenuRow 
            icon={Heart} 
            title="我的点赞" 
            iconColor="text-rose-500"
            iconBg="bg-rose-50"
            onClick={() => navigate('/minelikes')}
          />

          <MenuRow 
            icon={GitBranch} 
            title="AI Git 工具" 
            subTitle="智能代码版本管理"
            iconColor="text-gray-700"
            iconBg="bg-gray-100"
            onClick={() => navigate('/git')} 
          />

          <MenuRow 
            icon={Database} 
            title="知识库 RAG" 
            subTitle="个人数据检索增强"
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            onClick={() => navigate('/rag')} 
          />

          <div className="mt-10 mb-8">
            <Button 
              variant="destructive" 
              className="w-full h-14 text-[16px] font-semibold rounded-2xl bg-white border border-red-100 text-red-500 shadow-lg shadow-red-50 hover:bg-red-50 hover:border-red-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2" 
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              退出登录
            </Button>
          </div>
        </div>

        {/* 3. 底部占位符：确保内容不被导航栏挡住 */}
        <div className="h-[64px] shrink-0" />
      </div>

      {loading && <Loading />}
    </div>
  )
}