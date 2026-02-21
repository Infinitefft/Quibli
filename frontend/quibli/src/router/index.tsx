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
const Login = lazy(() => import('@/pages/Login'));
const Chat = lazy(() => import('@/pages/Chat'));
const Publish = lazy(() => import('@/pages/Publish'));
const Following = lazy(() => import('@/pages/Following'));
const Register = lazy(() => import('@/pages/Register'));
const Loading = lazy(() => import('@/components/Loading'));
const PublishQuestions = lazy(() => import('@/pages/Publish/PublishQuestions'));
const PublishPosts = lazy(() => import('@/pages/Publish/PublishPosts'));
const QuestionDetail = lazy(() => import('@/pages/QuestionDetail'));
const PostDetail = lazy(() => import('@/pages/PostDetail'));
const SearchSuggestions = lazy(() => import('@/pages/SearchSuggestions'));
const Search = lazy(() => import('@/pages/Search'));


export default function RouterConfig({children} : {children: React.ReactNode}) {
  return (
    <Router>
      <AliveScope>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/publish/questions" element={<PublishQuestions />} />
            <Route path="/publish/posts" element={<PublishPosts />} />
            <Route path="/questions/:id" element={<QuestionDetail />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/SearchSuggestions" element={<SearchSuggestions />} />
            <Route path="/search" element={<Search />} />

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