// 这个文件包含了对分类（Category）相关的数据库操作函数，包括获取所有分类、根据 ID 或名称查询分类、创建、更新和删除分类等功能。

import pool from '../../config/database.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../../config/Interface.js';

// ─── 获取所有分类（按排序权重升序）────────────────
export async function getAllCategories(): Promise<Category[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM categories ORDER BY sort_order ASC, id ASC'
  );
  return rows as Category[];
}

// ─── 根据 ID 查询分类 ─────────────────────────────
export async function getCategoryById(id: number): Promise<Category | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM categories WHERE id = ?',
    [id]
  );
  return rows.length > 0 ? (rows[0] as Category) : null;
}

// ─── 根据名称查询分类 ─────────────────────────────
export async function getCategoryByName(name: string): Promise<Category | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM categories WHERE name = ?',
    [name]
  );
  return rows.length > 0 ? (rows[0] as Category) : null;
}

// ─── 创建分类 ─────────────────────────────────────
export async function createCategory(input: CreateCategoryInput): Promise<number> {
  const { name, description, sort_order } = input;

  const existing = await getCategoryByName(name);
  if (existing) {
    throw new Error('分类名称已存在');
  }

  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO categories (name, description, sort_order) VALUES (?, ?, ?)',
    [name, description ?? null, sort_order ?? 0]
  );
  return result.insertId;
}

// ─── 更新分类 ─────────────────────────────────────
export async function updateCategory(
  id: number,
  input: UpdateCategoryInput
): Promise<boolean> {
  const fields: string[] = [];
  const values: any[] = [];

  if (input.name !== undefined) {
    fields.push('name = ?');
    values.push(input.name);
  }
  if (input.description !== undefined) {
    fields.push('description = ?');
    values.push(input.description);
  }
  if (input.sort_order !== undefined) {
    fields.push('sort_order = ?');
    values.push(input.sort_order);
  }

  if (fields.length === 0) return false;

  values.push(id);
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

// ─── 删除分类 ─────────────────────────────────────
export async function deleteCategory(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM categories WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}
