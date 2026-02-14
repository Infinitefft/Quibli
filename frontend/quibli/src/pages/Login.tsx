import React, {
  useState,
  useEffect,
} from 'react';

import { useUserStore } from '@/store/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft } from 'lucide-react';
import type { Credential } from '@/types/index';
import {
  useNavigate
} from 'react-router-dom';

interface LoginProps {
  onLoginSuccess?: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const { login } = useUserStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<Credential>({
    phone: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  }

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = formData.phone.trim();
    const password = formData.password.trim();
    if (!formData.phone || !formData.password) return;
    setLoading(true);
    try {
      await login({ phone, password })
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigate("/", { replace: true })
      }
    } catch (err) {
      console.log(err, "登录失败")
    } finally {
      setLoading(false);
    }
  }


  // -------------------------------------------------------------------------------//
  // Animation States
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  const phrases = ["欢迎来到 Quibli", "提问、探索、发现答案"];
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 2000;

  // 样式：打字机效果
  useEffect(() => {
    const i = loopNum % phrases.length;
    const fullText = phrases[i];

    let timer: ReturnType<typeof setTimeout>;

    if (isDeleting) {
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(fullText.substring(0, displayedText.length - 1));
        }, deletingSpeed);
      } else {
        // Finished deleting, switch to next phrase
        setIsDeleting(false);
        setLoopNum(prev => prev + 1);
      }
    } else {
      if (displayedText.length < fullText.length) {
        timer = setTimeout(() => {
          setDisplayedText(fullText.substring(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        // Finished typing, pause before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, loopNum]);


  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden">
      <style>{`
        @keyframes ballPulse {
          0%, 100% { 
            background-color: #000000; 
            transform: scale(1);
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
          }
          50% { 
            background-color: #9ca3af; 
            transform: scale(0.85);
            box-shadow: 0 0 0 rgba(0, 0, 0, 0);
          }
        }
        .cursor-ball {
          animation: ballPulse 1.5s infinite ease-in-out;
        }
      `}</style>

      {/* Subtle Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[40%] bg-blue-100/40 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[40%] bg-purple-100/40 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-sm mx-auto z-10">

        {/* Logo */}
        <div className="mb-10 relative group select-none">
          {/* Decorative Back Layer */}
          <div className="absolute -z-10 top-2 left-2 w-16 h-16 bg-gray-200 rounded-2xl transform -rotate-6 transition-transform duration-300 group-hover:-rotate-12" />

          {/* Main Icon Container */}
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-gray-200 transform rotate-3 transition-transform duration-300 group-hover:rotate-6">
            {/* Styled 'Q' SVG */}
            <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {/* Circle body of Q */}
              <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
              {/* Tail of Q */}
              <path d="M19 19l-3.5-3.5" />
            </svg>
          </div>
        </div>

        {/* Typing Text */}
        <div className="h-16 flex items-start justify-center text-center mb-8 w-full">
          {/* Added min-h-[2rem] to ensure container height persists when text is empty, preventing the ball from jumping up */}
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center min-h-[2rem]">
            {displayedText}
            <span className="cursor-ball ml-2 inline-block w-4 h-4 rounded-full" />
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div className="space-y-2">
            <Input
              id="name"
              value={formData.phone}
              onChange={handleChange}
              placeholder="账号(手机号)"
              className="h-14 bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent rounded-2xl px-5 text-base transition-all duration-200 shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <Input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="密码"
              className="h-14 bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent rounded-2xl px-5 text-base transition-all duration-200 shadow-sm"
            />
          </div>

          <Button
            className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-2xl text-base font-semibold transition-all duration-200 shadow-lg shadow-gray-300/50 hover:shadow-xl hover:shadow-gray-300/60 active:scale-[0.98] mt-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "登录"}
          </Button>
          <Button
            className="w-full h-14 bg-white hover:bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl text-base font-semibold transition-all duration-200 shadow-sm shadow-blue-100/50 hover:shadow-md hover:shadow-blue-200/50 active:scale-[0.98] mt-3"
            disabled={loading} onClick={() => navigate("/register")}
          >
            {loading ? (<Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />) : ("还没有账号？立即注册")}
          </Button>
        </form>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-center pb-safe z-10">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>返回首页</span>
        </button>
      </div>
    </div>
  )
}
