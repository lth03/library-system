import api from '@/api/login';
import type { ApiResponse, UserInfo, PaginationParams, UserBorrowStats, CreateUserParams, UsersResponse } from '@/config/Interface';

/** 获取用户列表（支持分页搜索）GET /api/users */
export async function getUsers(params?: PaginationParams & { keyword?: string }) {
  const res = await api.get<ApiResponse<UsersResponse>>('/users', { params });
  return res.data;
}

/** 获取单个用户 GET /api/users/:id */
export async function getUserById(id: number) {
  const res = await api.get<ApiResponse<UserInfo>>(`/users/${id}`);
  return res.data;
}

/** 获取用户借阅统计 GET /api/users/:id/stats */
export async function getUserBorrowStats(id: number) {
  const res = await api.get<ApiResponse<UserBorrowStats>>(`/users/${id}/stats`);
  return res.data;
}

/** 创建用户 POST /api/users */
export async function createUser(data: CreateUserParams) {
  const res = await api.post<ApiResponse<UserInfo>>('/users', data);
  return res.data;
}

/** 更新用户 PUT /api/users/:id */
export async function updateUser(id: number, data: Partial<Pick<UserInfo, 'name' | 'email' | 'phone' | 'role' | 'status'>>) {
  const res = await api.put<ApiResponse<UserInfo>>(`/users/${id}`, data);
  return res.data;
}

/** 删除用户 DELETE /api/users/:id */
export async function deleteUser(id: number) {
  const res = await api.delete<ApiResponse<null>>(`/users/${id}`);
  return res.data;
}

/** 重置密码 PUT /api/users/:id/reset-password */
export async function resetPassword(id: number, password: string) {
  const res = await api.put<ApiResponse<null>>(`/users/${id}/reset-password`, { password });
  return res.data;
}

/** 当前用户修改密码 PUT /api/users/password */
export async function changeMyPassword(oldPassword: string, newPassword: string) {
  const res = await api.put<ApiResponse<null>>('/users/password', { oldPassword, newPassword });
  return res.data;
}
