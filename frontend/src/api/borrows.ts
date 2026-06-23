import api from '@/api/login';
import type { ApiResponse, BorrowRecord, PaginatedBorrows, BorrowQueryParams, CreateBorrowParams } from '@/config/Interface';

/** 获取借阅记录列表 GET /api/borrows */
export async function getBorrows(params?: BorrowQueryParams) {
  const res = await api.get<ApiResponse<PaginatedBorrows>>('/borrows', { params });
  return res.data;
}

/** 获取借阅详情 GET /api/borrows/:id */
export async function getBorrowById(id: number) {
  const res = await api.get<ApiResponse<BorrowRecord>>(`/borrows/${id}`);
  return res.data;
}

/** 借书 POST /api/borrows */
export async function createBorrow(data: CreateBorrowParams) {
  const res = await api.post<ApiResponse<BorrowRecord>>('/borrows', data);
  return res.data;
}

/** 还书 PUT /api/borrows/:id/return */
export async function returnBorrow(id: number) {
  const res = await api.put<ApiResponse<BorrowRecord>>(`/borrows/${id}/return`);
  return res.data;
}

/** 续借 PUT /api/borrows/:id/renew */
export async function renewBorrow(id: number, due_date: string) {
  const res = await api.put<ApiResponse<BorrowRecord>>(`/borrows/${id}/renew`, { due_date });
  return res.data;
}
