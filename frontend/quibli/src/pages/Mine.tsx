import {
  useState
} from 'react';
// import { useMineStore } from '@/store/mine'
import { useUserStore } from '@/store/user'
import { useMineStore } from '@/store/mine';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerTitle,
  DrawerHeader,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Camera, Upload, Sparkle } from 'lucide-react';
import Loading from '@/components/Loading';
import { useNavigate } from 'react-router-dom';





export default function Mine() {
  const navigate = useNavigate();
  const {
    user,
    logout,
  } = useUserStore();
  const {
    mineProfile,
    aiAvatar,
  } = useMineStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = async(type: string) => {
    setOpen(false);
    if (type === 'ai') {
      setLoading(true);
      await aiAvatar();
      setLoading(false);
    }
  }


  // 退出登录并回到首页
  const handleLogout = async () => {
    navigate('/', { replace: true });
    // 延迟微秒清理状态，或者在目标页面的 useEffect 里清理
    // 这样 Mine 页面在卸载前，user 状态依然存在，不会触发守卫拦截
    setTimeout(() => {
      logout();
    }, 100);
  };

  // console.log(user, 'popopopoppop');


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-6 pb-10 mb-4">
        <div className="flex items-center space-x-4">
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center 
                justify-center text-primary text-xl font-bold"
              >
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {user?.nickname?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DrawerTrigger>

            {/* -------------------修改头像功能---------------- */}
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader className="text-left">
                  <DrawerTitle>修改头像</DrawerTitle>
                  <DrawerDescription>
                    选择一种方式更新您的个人头像
                  </DrawerDescription>
                </DrawerHeader>
                  <div className="p-4 space-y-3">
                    <Button variant="outline" className="w-full justify-start h-14 text-base"
                      onClick={() => handleAction('camera')}>
                      <Camera className="mr-3 h-4 w-5 text-blue-500" />
                      拍照
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-14 text-base"
                      onClick={() => handleAction('upload')}>
                      <Upload className="mr-3 h-4 w-5 text-blue-500" />
                      从相册上传
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-14 text-base
                      bg-gradient-to-r from-blue-600 to-indigo-600 border-none"
                      onClick={() => handleAction('ai')}>
                      <Sparkle className="mr-3 h-4 w-5 text-yellow-300" />
                      使用AI生成头像
                    </Button>
                  </div>
                  <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                      <Button variant="ghost" className="w-full h-12">取消</Button>
                    </DrawerClose>
                  </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
          {/* --------------------------------------------- */}
          <div>
            <h2 className="text-xl font-bold">{user?.nickname}</h2>
            <p className="text-sm text-gray-500">ID: {user?.id}</p>
          </div>
        </div>
      </div>
      {/* -------------------------------------------- */}
      <div className="mt-4 space-y-4 p-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center py-2 border-b last:border-0">
            <span>我的订单</span>
            <span className="text-gray-400 text-sm">&gt;</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b last:border-0"
            onClick={() => navigate('/git')}
          >
            <span>AI git 工具</span>
            <span className="text-gray-400 text-sm">&gt;</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b last:border-0"
            onClick={() => navigate('/rag')}
          >
            <span>RAG</span>
            <span className="text-gray-400 text-sm">&gt;</span>
          </div>
        </div>


        <Button variant="destructive" className="w-full mt-8 h-12 text-base font-semibold
          shadow-md shadow-red-100" onClick={() => handleLogout()}
        >
          退出登录
        </Button>


      </div>
      { loading && <Loading /> }
    </div>
  )
}