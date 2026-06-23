import api from '@/api/login';
import type { ApiResponse, DashboardData } from '@/config/Interface';

/** 获取仪表盘完整数据 GET /api/dashboard */
export async function getDashboardData() {
  const res = await api.get<ApiResponse<DashboardData>>('/dashboard');
  return res.data;
}
