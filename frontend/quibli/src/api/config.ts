import axios from 'axios';
import { useUserStore } from '@/store/user';

const instance = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'https://dodge-scenario-accompanying-hand.trycloudflare.com') + '/api',
});

instance.interceptors.request.use(config => {
  const token = useUserStore.getState().accessToken;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let requestQueue: any[] = [];

instance.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    const { config, response } = err;

    if (response?.status === 401 && !config._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          requestQueue.push((token: string) => {
            config.headers.Authorization = `Bearer ${token}`;
            resolve(instance(config));
          });
        });
      }

      config._retry = true; // 注意：这里用 _retry 比较规范
      isRefreshing = true;

      try {
        const { refreshToken } = useUserStore.getState();
        if (refreshToken) {
          // ✅ 关键：使用原始 axios 发送请求，避免进入 instance 的死循环
          const res = await axios.post(`${instance.defaults.baseURL}/auth/refresh`, {
            refresh_token: refreshToken
          });

          const { access_token, refresh_token } = res.data;

          useUserStore.setState({
            accessToken: access_token,
            refreshToken: refresh_token,
            isLogin: true,
          });

          requestQueue.forEach((callback) => callback(access_token));
          requestQueue = [];

          config.headers.Authorization = `Bearer ${access_token}`;
          return instance(config);
        }
      } catch (refreshErr) {
        // 如果 refresh_token 也过期了，清空状态并跳转
        useUserStore.setState({ isLogin: false, accessToken: null, refreshToken: null });
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default instance;