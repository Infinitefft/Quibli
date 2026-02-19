import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/user';
import { needsLoginPath } from '@/App';

// Icon Component Props
interface IconProps {
  isActive: boolean;
  className?: string;
}

// 1. Home Icon - Rounded House with "Breathing Room"
const HomeIcon = ({ isActive, className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {isActive ? (
      <>
        <path
          d="M2 12L12 2L22 12V20C22 21.1 21.1 22 20 22H4C2.9 22 2 21.1 2 20V12Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Negative Space Door */}
        <path d="M9 22V16H15V22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ) : (
      <path
        d="M2 12L12 2L22 12V20C22 21.1 21.1 22 20 22H4C2.9 22 2 21.1 2 20V12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

// 2. Qchat Icon - Rounded Q with Dots
const ChatIcon = ({ isActive, className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {isActive ? (
      <>
        {/* Main Body - Very Rounded (Circle-ish) */}
        <rect x="2" y="2" width="20" height="20" rx="10" fill="currentColor" />
        {/* Q Tail - Extending out */}
        <path d="M16 16L21 21" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        {/* Dots */}
        <circle cx="8" cy="12" r="1.5" fill="white" />
        <circle cx="12" cy="12" r="1.5" fill="white" />
        <circle cx="16" cy="12" r="1.5" fill="white" />
      </>
    ) : (
      <>
        <rect x="2" y="2" width="20" height="20" rx="10" stroke="currentColor" strokeWidth="2" />
        <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="8" cy="12" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <circle cx="16" cy="12" r="1" fill="currentColor" />
      </>
    )}
  </svg>
);

// 3. Publish Icon - Plus Symbol (Used inside the Blue Button)
const PublishIcon = ({ isActive, className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M12 6V18M6 12H18"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 4. Following Icon - Classic Heart
const FollowingIcon = ({ isActive, className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {isActive ? (
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0" 
      />
    ) : (
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

// 5. Mine/User Icon - Fuller Silhouette (Active) vs Fuller Outline (Inactive)
const UserIcon = ({ isActive, className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {isActive ? (
      <>
        {/* Fully Filled Active State: Larger Head & Shoulders (Fuller) */}
        <circle cx="12" cy="7" r="5" fill="currentColor" />
        <path d="M20 21V18C20 15.24 16.42 13 12 13C7.58 13 4 15.24 4 18V21" fill="currentColor" />
      </>
    ) : (
      <>
        {/* Outlined Inactive State: Matching Fuller Shape */}
        <circle cx="12" cy="7" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 21V18C20 15.24 16.42 13 12 13C7.58 13 4 15.24 4 18V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    )}
  </svg>
);

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isLogin } = useUserStore((state) => state);

  const tabs = [
    { label: '首页', path: "/", Icon: HomeIcon },
    { label: 'Qlib', path: "/chat", Icon: ChatIcon },
    { label: '发布', path: "/publish", Icon: PublishIcon },
    { label: '关注', path: "/following", Icon: FollowingIcon },
    { label: '我的', path: "/mine", Icon: UserIcon }
  ];

  const handleNav = (path: string) => {
    if (path === pathname) return;
    if (needsLoginPath.includes(path) && !isLogin) {
      navigate('/login');
      return;
    }
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[64px] 
      bg-white border-t border-gray-100 dark:bg-black/95 dark:border-gray-800
      flex items-center justify-around
      z-50 safe-area-bottom shadow-sm touch-none"
    >
      {tabs.map((tab) => {
        const IconComponent = tab.Icon;
        const isActive = pathname === tab.path;
        
        // Special render for Publish button:
        // - Blue background (bg-blue-600)
        // - Larger size (w-[48px] h-[38px])
        // - Rounded corners (rounded-2xl)
        if (tab.label === '发布') {
           return (
             <button
                key={tab.path}
                onClick={() => handleNav(tab.path)}
                className="flex flex-col items-center justify-center w-14"
             >
                <div className={cn(
                  "w-[48px] h-[38px] rounded-2xl flex items-center justify-center transition-all duration-200 shadow-md",
                  isActive 
                    ? "bg-blue-600 text-white ring-2 ring-blue-100" 
                    : "bg-blue-600 text-white active:bg-blue-700"
                )}>
                   <IconComponent 
                      isActive={true} // Always render the bolder version inside the button
                      className="w-6 h-6 text-white"
                   />
                </div>
             </button>
           )
        }

        return (
          <button
            key={tab.path}
            onClick={() => handleNav(tab.path)}
            className="flex flex-col items-center justify-center w-16"
          >
            <IconComponent 
              isActive={isActive} 
              className={cn(
                "w-[28px] h-[28px] transition-colors duration-200",
                isActive ? "text-black" : "text-gray-400"
              )}
            />
            
            {/* Label */}
            <span className={cn(
              "text-[10px] font-medium mt-1 transition-colors duration-200",
              isActive ? "text-black" : "text-gray-400"
            )}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}