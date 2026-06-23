import api from '@/api/login';
import type { ApiResponse } from '@/config/Interface';

/**
 * 退出登录
 * 调用后端销毁 token，同时清除本地存储
 */
export async function logoutApi(): Promise<ApiResponse<null>> {
  const res = await api.post<ApiResponse<null>>('/logout');
  return res.data;
}
