import pool from '../../config/database.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type {
  Book,
  CreateBookInput,
  UpdateBookInput,
  PaginatedResult,
} from '../../config/Interface.js';

// ─── 查询所有图书 ────────────────────────────────────
export async function getAllBooks(): Promise<Book[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT b.*, c.name AS category_name
     FROM books b
     LEFT JOIN categories c ON b.category_id = c.id
     ORDER BY b.id ASC`
  );
  return rows as Book[];
}

// ─── 根据 ID 查询图书 ────────────────────────────────
export async function getBookById(id: number): Promise<Book | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT b.*, c.name AS category_name
     FROM books b
     LEFT JOIN categories c ON b.category_id = c.id
     WHERE b.id = ?`,
    [id]
  );
  return rows.length > 0 ? (rows[0] as Book) : null;
}

// ─── 根据 ISBN 查询图书 ──────────────────────────────
export async function getBookByIsbn(isbn: string): Promise<Book | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT b.*, c.name AS category_name
     FROM books b
     LEFT JOIN categories c ON b.category_id = c.id
     WHERE b.isbn = ?`,
    [isbn]
  );
  return rows.length > 0 ? (rows[0] as Book) : null;
}

// ─── 创建图书 ────────────────────────────────────────
export async function createBook(input: CreateBookInput): Promise<number> {
  const {
    isbn,
    title,
    author,
    publisher,
    publish_year,
    category_id,
    description,
    cover_url,
    total_count,
    available_count,
  } = input;

  // 检查 ISBN 是否已存在
  const existing = await getBookByIsbn(isbn);
  if (existing) {
    throw new Error('ISBN 已存在');
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO books (isbn, title, author, publisher, publish_year, category_id, description, cover_url, total_count, available_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      isbn,
      title,
      author,
      publisher ?? null,
      publish_year ?? null,
      category_id ?? null,
      description ?? null,
      cover_url ?? null,
      total_count ?? 1,
      available_count ?? 1,
    ]
  );
  return result.insertId;
}

// ─── 更新图书信息 ────────────────────────────────────
export async function updateBook(
  id: number,
  input: UpdateBookInput
): Promise<boolean> {
  const fields: string[] = [];
  const values: any[] = [];

  if (input.title !== undefined) {
    fields.push('title = ?');
    values.push(input.title);
  }
  if (input.author !== undefined) {
    fields.push('author = ?');
    values.push(input.author);
  }
  if (input.publisher !== undefined) {
    fields.push('publisher = ?');
    values.push(input.publisher);
  }
  if (input.publish_year !== undefined) {
    fields.push('publish_year = ?');
    values.push(input.publish_year);
  }
  if (input.category_id !== undefined) {
    fields.push('category_id = ?');
    values.push(input.category_id);
  }
  if (input.description !== undefined) {
    fields.push('description = ?');
    values.push(input.description);
  }
  if (input.cover_url !== undefined) {
    fields.push('cover_url = ?');
    values.push(input.cover_url);
  }
  if (input.total_count !== undefined) {
    fields.push('total_count = ?');
    values.push(input.total_count);
  }
  if (input.available_count !== undefined) {
    fields.push('available_count = ?');
    values.push(input.available_count);
  }
  if (input.status !== undefined) {
    fields.push('status = ?');
    values.push(input.status);
  }

  if (fields.length === 0) return false;

  values.push(id);
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE books SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

// ─── 删除图书 ────────────────────────────────────────
export async function deleteBook(id: number): Promise<boolean> {
  // 检查是否有未还的借阅记录
  const [borrowRows] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS cnt FROM borrow_records WHERE book_id = ? AND status IN ('borrowed', 'overdue')",
    [id]
  );
  if (borrowRows[0].cnt > 0) {
    throw new Error(`该图书还有 ${borrowRows[0].cnt} 本书未归还，无法删除`);
  }

  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM books WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}

// ─── 分页查询图书 ────────────────────────────────────
export async function getBooksPaginated(
  page: number,
  pageSize: number,
  keyword?: string,
  categoryId?: number
): Promise<PaginatedResult<Book>> {
  const offset = (page - 1) * pageSize;
  let countSql = 'SELECT COUNT(*) AS total FROM books b';
  let querySql = `
    SELECT b.*, c.name AS category_name
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.id`;
  const params: any[] = [];
  const conditions: string[] = [];

  if (keyword) {
    const like = `%${keyword}%`;
    conditions.push('(b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? OR b.publisher LIKE ?)');
    params.push(like, like, like, like);
  }

  if (categoryId !== undefined) {
    conditions.push('b.category_id = ?');
    params.push(categoryId);
  }

  if (conditions.length > 0) {
    const where = ' WHERE ' + conditions.join(' AND ');
    countSql += where;
    querySql += where;
  }

  querySql += ' ORDER BY b.id ASC LIMIT ? OFFSET ?';

  const [countRows] = await pool.execute<RowDataPacket[]>(countSql, params);
  const total = countRows[0].total;

  const [rows] = await pool.query<RowDataPacket[]>(querySql, [
    ...params,
    pageSize,
    offset,
  ]);

  return {
    data: rows as Book[],
    total,
    page,
    pageSize,
  };
}

// ─── 更新图书可借数量（借书时减1，还书时加1）───────
export async function updateAvailableCount(
  bookId: number,
  delta: number
): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE books SET available_count = available_count + ? WHERE id = ? AND (available_count + ?) >= 0',
    [delta, bookId, delta]
  );
  return result.affectedRows > 0;
}

// ─── 获取某分类下的图书数量 ──────────────────────────
export async function getBookCountByCategory(categoryId: number): Promise<number> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) AS total FROM books WHERE category_id = ?',
    [categoryId]
  );
  return rows[0].total;
}
