import {
  Suspense,
  lazy,
} from 'react';


import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';



import { AliveScope } from 'react-activation';  // 要缓存的范围
import MainLayout from '@/layouts/MainLayout';


const Home = lazy(() => import('@/components/KeepAliveHome'));   // 拿到缓存的首页
const Mine = lazy(() => import('@/pages/Mine'));
const Search = lazy(() => import('@/pages/SearchDetails'));
const Login = lazy(() => import('@/pages/Login'));
const Chat = lazy(() => import('@/pages/Chat'));
const Publish = lazy(() => import('@/pages/Publish'));
const Following = lazy(() => import('@/pages/Following'));
const Register = lazy(() => import('@/pages/Register'));
const Loading = lazy(() => import('@/components/Loading'));



export default function RouterConfig({children} : {children: React.ReactNode}) {
  return (
    <Router>
      <AliveScope>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/search" element={<Search />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<MainLayout />}>
              <Route path="" element={<Home />} />
              <Route path="chat" element={<Chat />} />
              <Route path="publish" element={<Publish />} />
              <Route path="following" element={<Following />} />
              <Route path="mine" element={<Mine />} />
            </Route>
          </Routes>
        </Suspense>
      </AliveScope>
      {children}
    </Router>
  )
}