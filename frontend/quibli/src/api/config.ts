import axios from 'axios';
import { useUserStore } from '@/store/user';


// instance 拦截器
const instance = axios.create({
  baseURL: 'http://localhost:3001/api',
})

// 请求拦截器，在请求发送前添加 token
instance.interceptors.request.use(config => {
  const token = useUserStore.getState().accessToken;
  if (token) {
    // 将 token 添加到请求头
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
})


export default instance;