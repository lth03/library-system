import api from '@/api/login';
import type { ApiResponse, Category, CreateCategoryParams, UpdateCategoryParams } from '@/config/Interface';

// ─── 分类 API ─────────────────────────────────────

/** 获取所有分类 GET /api/categories */
export async function getCategories() {
  const res = await api.get<ApiResponse<Category[]>>('/categories');
  return res.data;
}

/** 创建分类 POST /api/categories */
export async function createCategory(data: CreateCategoryParams) {
  const res = await api.post<ApiResponse<Category>>('/categories', data);
  return res.data;
}

/** 更新分类 PUT /api/categories/:id */
export async function updateCategory(id: number, data: UpdateCategoryParams) {
  const res = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
  return res.data;
}

/** 删除分类 DELETE /api/categories/:id */
export async function deleteCategoryApi(id: number) {
  const res = await api.delete<ApiResponse<null>>(`/categories/${id}`);
  return res.data;
}
