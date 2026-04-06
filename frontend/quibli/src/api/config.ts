import axios from 'axios';
import { useUserStore } from '@/store/user';

const instance = axios.create({
  baseURL: 'http://localhost:3001/api',
});

/** 用 refresh_token 换新的 access（与拦截器共用，不落盘 access，仅写入 zustand 内存态） */
export async function refreshSessionWithRefreshToken(): Promise<string | null> {
  const { refreshToken } = useUserStore.getState();
  if (!refreshToken) return null;
  try {
    const res = await axios.post(`${instance.defaults.baseURL}/auth/refresh`, {
      refresh_token: refreshToken,
    });
    const { access_token, refresh_token } = res.data;
    useUserStore.setState({
      accessToken: access_token,
      refreshToken: refresh_token,
      isLogin: true,
    });
    return access_token;
  } catch {
    useUserStore.setState({
      isLogin: false,
      accessToken: null,
      refreshToken: null,
    });
    return null;
  }
}

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
        const access_token = await refreshSessionWithRefreshToken();
        if (access_token) {
          requestQueue.forEach((callback) => callback(access_token));
          requestQueue = [];

          config.headers.Authorization = `Bearer ${access_token}`;
          return instance(config);
        }
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default instance;