import axios from 'axios';
import type { ApiResponse, LoginData } from '@/config/Interface';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器：自动附带 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：仅当请求携带了 token 且返回 401 时才视为登录过期
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // 登录接口本身的 401（用户名/密码错误）不触发跳转
    const hadToken = err.config?.headers?.Authorization;
    if (err.response?.status === 401 && hadToken) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── 登录 API ─────────────────────────────────────
export async function loginApi(username: string, password: string): Promise<ApiResponse<LoginData>> {
  const res = await api.post<ApiResponse<LoginData>>('/login', { username, password });
  return res.data;
}
