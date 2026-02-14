import {
  useEffect,
} from 'react'

import './App.css'
// import RouterConfig from '@/router'
import { useUserStore } from '@/store/user'

import {
  useNavigate,
  useLocation,
} from 'react-router-dom'


export const needsLoginPath = ['/mine', '/following', '/chat']


function App() {
  const { isLogin } = useUserStore();
  // console.log("isLogin：", isLogin);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!isLogin && needsLoginPath.includes(pathname)) {
      navigate('/login')
    }
  }, [isLogin, navigate, pathname])

  return (
    <>
      {/* <RouterConfig /> */}
    </>
  )
}

export default App