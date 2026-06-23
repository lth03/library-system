import api from '@/api/login';
import type { ApiResponse, BookInfo, BooksResponse, BookQueryParams, CreateBookParams, UpdateBookParams } from '@/config/Interface';

// ─── 图书 API ─────────────────────────────────────

/** 获取图书列表（支持分页搜索）GET /api/books */
export async function getBooks(params?: BookQueryParams) {
  const res = await api.get<ApiResponse<BooksResponse>>('/books', { params });
  return res.data;
}

/** 获取单个图书 GET /api/books/:id */
export async function getBookById(id: number) {
  const res = await api.get<ApiResponse<BookInfo>>(`/books/${id}`);
  return res.data;
}

/** 创建图书 POST /api/books */
export async function createBook(data: CreateBookParams) {
  const res = await api.post<ApiResponse<BookInfo>>('/books', data);
  return res.data;
}

/** 更新图书 PUT /api/books/:id */
export async function updateBook(id: number, data: UpdateBookParams) {
  const res = await api.put<ApiResponse<BookInfo>>(`/books/${id}`, data);
  return res.data;
}

/** 删除图书 DELETE /api/books/:id */
export async function deleteBookApi(id: number) {
  const res = await api.delete<ApiResponse<null>>(`/books/${id}`);
  return res.data;
}
