import pool from '../../config/database.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { PaginatedResult } from '../../config/Interface.js';

// ─── 借阅记录查询结果（含关联信息）────────────────
export interface BorrowRecordRow {
  id: number;
  user_id: number;
  userName: string;
  book_id: number;
  bookTitle: string;
  bookAuthor: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: 'borrowed' | 'returned' | 'overdue';
  renew_count: number;
}

// ─── 逾期状态自动更新 ────────────────────────────
/**
 * 将所有已过应还日期但状态仍为 'borrowed' 的记录标记为 'overdue'
 * 在每次查询借阅记录前调用，保证数据实时准确
 */
export async function updateOverdueStatus(): Promise<void> {
  await pool.execute<ResultSetHeader>(
    "UPDATE borrow_records SET status = 'overdue' WHERE status = 'borrowed' AND due_date < CURDATE()"
  );
}

// ─── 分页查询借阅记录 ────────────────────────────
export async function getBorrowsPaginated(
  page: number,
  pageSize: number,
  keyword?: string,
  status?: string
): Promise<PaginatedResult<BorrowRecordRow>> {
  await updateOverdueStatus();
  const offset = (page - 1) * pageSize;
  let countSql = `SELECT COUNT(*) AS total FROM borrow_records br
    JOIN users u ON br.user_id = u.id
    JOIN books b ON br.book_id = b.id`;
  let querySql = `
    SELECT br.id, br.user_id, u.name AS userName,
           br.book_id, b.title AS bookTitle, b.author AS bookAuthor,
           DATE_FORMAT(br.borrow_date, '%Y-%m-%d') AS borrow_date,
           DATE_FORMAT(br.due_date, '%Y-%m-%d') AS due_date,
           DATE_FORMAT(br.return_date, '%Y-%m-%d') AS return_date,
           br.status, br.renew_count
    FROM borrow_records br
    JOIN users u ON br.user_id = u.id
    JOIN books b ON br.book_id = b.id`;
  const params: any[] = [];
  const conditions: string[] = [];

  if (keyword) {
    const like = `%${keyword}%`;
    conditions.push('(u.name LIKE ? OR b.title LIKE ? OR b.author LIKE ?)');
    params.push(like, like, like);
  }

  if (status) {
    conditions.push('br.status = ?');
    params.push(status);
  }

  if (conditions.length > 0) {
    const where = ' WHERE ' + conditions.join(' AND ');
    countSql += where;
    querySql += where;
  }

  querySql += ' ORDER BY br.created_at DESC LIMIT ? OFFSET ?';

  const [countRows] = await pool.execute<RowDataPacket[]>(countSql, params);
  const total = countRows[0].total;

  const [rows] = await pool.query<RowDataPacket[]>(querySql, [
    ...params,
    pageSize,
    offset,
  ]);

  return { data: rows as BorrowRecordRow[], total, page, pageSize };
}

// ─── 根据用户 ID 分页查询 ────────────────────────
export async function getBorrowsByUser(
  userId: number,
  page: number,
  pageSize: number,
  status?: string
): Promise<PaginatedResult<BorrowRecordRow>> {
  await updateOverdueStatus();
  const offset = (page - 1) * pageSize;
  let countSql = `SELECT COUNT(*) AS total FROM borrow_records br
    JOIN users u ON br.user_id = u.id
    JOIN books b ON br.book_id = b.id WHERE br.user_id = ?`;
  let querySql = `
    SELECT br.id, br.user_id, u.name AS userName,
           br.book_id, b.title AS bookTitle, b.author AS bookAuthor,
           DATE_FORMAT(br.borrow_date, '%Y-%m-%d') AS borrow_date,
           DATE_FORMAT(br.due_date, '%Y-%m-%d') AS due_date,
           DATE_FORMAT(br.return_date, '%Y-%m-%d') AS return_date,
           br.status, br.renew_count
    FROM borrow_records br
    JOIN users u ON br.user_id = u.id
    JOIN books b ON br.book_id = b.id
    WHERE br.user_id = ?`;
  const params: any[] = [userId];
  const queryParams: any[] = [userId];

  if (status) {
    countSql += ' AND br.status = ?';
    querySql += ' AND br.status = ?';
    params.push(status);
    queryParams.push(status);
  }

  querySql += ' ORDER BY br.created_at DESC LIMIT ? OFFSET ?';

  const [countRows] = await pool.execute<RowDataPacket[]>(countSql, params);
  const total = countRows[0].total;

  const [rows] = await pool.query<RowDataPacket[]>(querySql, [...queryParams, pageSize, offset]);

  return { data: rows as BorrowRecordRow[], total, page, pageSize };
}

// ─── 根据 ID 查询借阅记录 ────────────────────────
export async function getBorrowById(id: number): Promise<BorrowRecordRow | null> {
  await updateOverdueStatus();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT br.id, br.user_id, u.name AS userName,
            br.book_id, b.title AS bookTitle, b.author AS bookAuthor,
            DATE_FORMAT(br.borrow_date, '%Y-%m-%d') AS borrow_date,
            DATE_FORMAT(br.due_date, '%Y-%m-%d') AS due_date,
            DATE_FORMAT(br.return_date, '%Y-%m-%d') AS return_date,
            br.status, br.renew_count
     FROM borrow_records br
     JOIN users u ON br.user_id = u.id
     JOIN books b ON br.book_id = b.id
     WHERE br.id = ?`,
    [id]
  );
  return rows.length > 0 ? (rows[0] as BorrowRecordRow) : null;
}

// ─── 创建借阅记录（借书）─────────────────────────
export async function createBorrow(
  userId: number,
  bookId: number,
  dueDate: string
): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO borrow_records (user_id, book_id, due_date) VALUES (?, ?, ?)',
    [userId, bookId, dueDate]
  );
  return result.insertId;
}

// ─── 还书 ──────────────────────────────────────────
export async function returnBook(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE borrow_records SET status = 'returned', return_date = NOW() WHERE id = ? AND status IN ('borrowed', 'overdue')",
    [id]
  );
  return result.affectedRows > 0;
}

// ─── 续借 ──────────────────────────────────────────
export async function renewBorrow(id: number, newDueDate: string): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE borrow_records SET renew_count = renew_count + 1, due_date = ?, status = 'borrowed' WHERE id = ? AND status IN ('borrowed', 'overdue')",
    [newDueDate, id]
  );
  return result.affectedRows > 0;
}
