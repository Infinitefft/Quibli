import {
  Suspense,
  lazy,
} from 'react';


import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';



import { AliveScope } from 'react-activation';
import MainLayout from '@/layouts/MainLayout';

const HomeFeedLayout = lazy(() => import('@/pages/home/HomeFeedLayout'));
const HomePostsPanel = lazy(() => import('@/pages/home/HomePostsPanel'));
const HomeQuestionsPanel = lazy(() => import('@/pages/home/HomeQuestionsPanel'));
const Mine = lazy(() => import('@/pages/Mine'));
const Login = lazy(() => import('@/pages/Login'));
const Chat = lazy(() => import('@/pages/Chat'));
const Publish = lazy(() => import('@/pages/Publish'));
const Following = lazy(() => import('@/pages/Following'));
const Register = lazy(() => import('@/pages/Register'));
const Loading = lazy(() => import('@/components/Loading'));
const PublishQuestions = lazy(() => import('@/pages/Publish/PublishQuestions'));
const PublishPosts = lazy(() => import('@/pages/Publish/PublishPosts'));
const QuestionDetail = lazy(() => import('@/components/question/QuestionDetail'));
const PostDetail = lazy(() => import('@/components/post/PostDetail'));
const SearchSuggestions = lazy(() => import('@/pages/SearchSuggestions'));
const Search = lazy(() => import('@/pages/Search'));
const MineFavorites = lazy(() => import('@/pages/MineFavorites'));
const MineLikes = lazy(() => import('@/pages/MineLikes'));
const UserQuestionsInfomations = lazy(() => import('@/components/userpublish/UserQuestionsInfomations'));
const UserPostsInfomations = lazy(() => import('@/components/userpublish/UserPostsInfomations'));
const UserPublishPage = lazy(() => import('@/components/userpublish/UserPublishPage'));
const FollowingInformation = lazy(() => import('@/components/userFollow/FollowingInformation'));
const UserFollowPage = lazy(() => import('@/components/userFollow/UserFollowPage'));


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
            <Route path="/searchsuggestions" element={<SearchSuggestions />} />
            <Route path="/search" element={<Search />} />
            <Route path="/minefavorites" element={<MineFavorites />} />
            <Route path="/minelikes" element={<MineLikes />} />

            {/* 用户发布文章/问题列表 */}
            <Route path="/user/:userId/posts" element={
                <UserPublishPage type="posts">
                  <UserPostsInfomations />
                </UserPublishPage>} />
                
            <Route path="/user/:userId/questions" element={
                <UserPublishPage type="questions">
                  <UserQuestionsInfomations />
                </UserPublishPage>} />

            {/* 用户社交关系列表 (关注/粉丝) */}
            <Route path="/user/:userId/follow" element={
                <UserFollowPage>
                  <FollowingInformation />
                </UserFollowPage>
            } />


            <Route path="/" element={<MainLayout />}>
              {/* 来到路径 / 下强行转到/feed/posts 下   to="/feed/posts" */}
              <Route index element={<Navigate to="/feed/posts" replace />} />  
              <Route
                path="feed"
                element={
                  <Suspense fallback={null}>
                    <HomeFeedLayout />
                  </Suspense>
                }
              >
                {/* 来到路径 /feed 强行转到 /feed/posts 下 */}
                <Route index element={<Navigate to="posts" replace />} />
                <Route
                  path="posts"
                  element={
                    <Suspense fallback={null}>
                      <HomePostsPanel />
                    </Suspense>
                  }
                />
                <Route
                  path="questions"
                  element={
                    <Suspense fallback={null}>
                      <HomeQuestionsPanel />
                    </Suspense>
                  }
                />
              </Route>
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