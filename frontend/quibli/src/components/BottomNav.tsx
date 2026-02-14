import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/store/user'
import { needsLoginPath } from '@/App'

// Icon Component Props
interface IconProps {
  isActive: boolean;
}

// 1. Home Icon (House)
const HomeIcon = ({ isActive }: IconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn(
      "transition-all duration-300",
      isActive ? "text-blue-600 fill-blue-100" : "text-black fill-none"
    )}
  >
    <path
      d="M3 9.5L12 2.5L21 9.5V20.5C21 21.0523 20.5523 21.5 20 21.5H15V14.5H9V21.5H4C3.44772 21.5 3 21.0523 3 20.5V9.5Z"
      stroke="currentColor"
      strokeWidth={isActive ? "2" : "1.5"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// 2. Chat Icon (Message Bubble)
const ChatIcon = ({ isActive }: IconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn(
      "transition-all duration-300",
      isActive ? "text-blue-600 fill-blue-100" : "text-black fill-none"
    )}
  >
    <path
      d="M21 11.5C21 16.1944 16.9706 20 12 20C10.6689 20 9.40693 19.7276 8.26903 19.2317L3 21L4.78652 16.2941C3.65751 15.0118 3 13.332 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z"
      stroke="currentColor"
      strokeWidth={isActive ? "2" : "1.5"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// 3. Publish/Editor Icon (Plus Square)
const PublishIcon = ({ isActive }: IconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn(
      "transition-all duration-300",
      isActive ? "text-blue-600 fill-blue-100" : "text-black fill-none"
    )}
  >
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="5"
      stroke="currentColor"
      strokeWidth={isActive ? "2" : "1.5"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 8V16M8 12H16"
      stroke="currentColor"
      strokeWidth={isActive ? "2" : "1.5"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// 4. Following Icon (Heart)
const FollowingIcon = ({ isActive }: IconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn(
      "transition-all duration-300",
      isActive ? "text-blue-600 fill-blue-100" : "text-black fill-none"
    )}
  >
    <path
      d="M20.84 4.60999C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.60999L12 5.66999L10.94 4.60999C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.60999C2.1283 5.64169 1.54871 7.04096 1.54871 8.49999C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3094 9.93789 22.4518 9.22248 22.4518 8.49999C22.4518 7.77751 22.3094 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.60999Z"
      stroke="currentColor"
      strokeWidth={isActive ? "2" : "1.5"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// 5. Mine/User Icon (Person)
const UserIcon = ({ isActive }: IconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn(
      "transition-all duration-300",
      isActive ? "text-blue-600 fill-blue-100" : "text-black fill-none"
    )}
  >
    <path
      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
      stroke="currentColor"
      strokeWidth={isActive ? "2" : "1.5"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
      stroke="currentColor"
      strokeWidth={isActive ? "2" : "1.5"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isLogin } = useUserStore((state) => state);

  const tabs = [
    {
      label: '首页',
      path: "/",
      Icon: HomeIcon
    },
    {
      label: 'Qchat',
      path: "/chat",
      Icon: ChatIcon
    },
    {
      label: '发布',
      path: "/publish",
      Icon: PublishIcon
    },
    {
      label: '关注',
      path: "/following",
      Icon: FollowingIcon
    },
    {
      label: '我的',
      path: "/mine",
      Icon: UserIcon
    }
  ]

  const handleNav = (path: string) => {
    if (path === pathname) {
      return;
    }
    if (needsLoginPath.includes(path) && !isLogin) {
      navigate('/login');
      return;
    }
    navigate(path);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16
      border-t border-gray-100 bg-white dark:bg-black/95 dark:border-gray-800
      flex items-center justify-around
      z-50 safe-area-bottom shadow-[0_-1px_3px_rgba(0,0,0,0.02)]"
    >
      {
        tabs.map(tab => {
          const IconComponent = tab.Icon;
          const isActive = pathname === tab.path;

          return (
            <button
              key={tab.path}
              onClick={() => handleNav(tab.path)}
              className="flex flex-col items-center justify-center
              w-full h-full space-y-1 group active:scale-95 transition-transform"
            >
              <IconComponent isActive={isActive} />
              <span className={cn(
                "text-[10px] font-medium transition-colors duration-300",
                isActive ? "text-blue-600" : "text-gray-500"
              )}>
                {tab.label}
              </span>
            </button>
          )
        })
      }
    </div>
  )
}
