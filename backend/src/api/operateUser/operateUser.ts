import pool from '../../config/database.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserBorrowStats,
  PaginatedResult,
} from '../../config/Interface.js';

// ─── 查询所有用户 ────────────────────────────────────
export async function getAllUsers(): Promise<User[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, username, name, email, phone, role, status, created_at, updated_at FROM users ORDER BY id ASC'
  );
  return rows as User[];
}

// ─── 根据 ID 查询用户（不含密码）────────────────────
export async function getUserById(id: number): Promise<User | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, username, name, email, phone, role, status, created_at, updated_at FROM users WHERE id = ?',
    [id]
  );
  return rows.length > 0 ? (rows[0] as User) : null;
}

// ─── 根据用户名查询用户（含密码，用于登录验证）───────
export async function getUserByUsername(username: string): Promise<User | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );
  return rows.length > 0 ? (rows[0] as User) : null;
}

// ─── 创建用户 ────────────────────────────────────────
export async function createUser(input: CreateUserInput): Promise<number> {
  const { username, password, name, email, phone, role } = input;

  // 检查用户名是否已存在
  const existing = await getUserByUsername(username);
  if (existing) {
    throw new Error('用户名已存在');
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO users (username, password, name, email, phone, role)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, password, name, email ?? null, phone ?? null, role ?? 'user']
  );
  return result.insertId;
}

// ─── 更新用户信息 ────────────────────────────────────
export async function updateUser(
  id: number,
  input: UpdateUserInput
): Promise<boolean> {
  const fields: string[] = [];
  const values: any[] = [];

  if (input.name !== undefined) {
    fields.push('name = ?');
    values.push(input.name);
  }
  if (input.email !== undefined) {
    fields.push('email = ?');
    values.push(input.email);
  }
  if (input.phone !== undefined) {
    fields.push('phone = ?');
    values.push(input.phone);
  }
  if (input.role !== undefined) {
    fields.push('role = ?');
    values.push(input.role);
  }
  if (input.status !== undefined) {
    fields.push('status = ?');
    values.push(input.status);
  }

  if (fields.length === 0) return false;

  values.push(id);
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

// ─── 更新密码 ────────────────────────────────────────
export async function updatePassword(
  id: number,
  hashedPassword: string
): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE users SET password = ? WHERE id = ?',
    [hashedPassword, id]
  );
  return result.affectedRows > 0;
}

// ─── 删除用户 ────────────────────────────────────────
export async function deleteUser(id: number): Promise<boolean> {
  // 检查是否有未还的借阅记录
  const [borrowRows] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS cnt FROM borrow_records WHERE user_id = ? AND status IN ('borrowed', 'overdue')",
    [id]
  );
  if (borrowRows[0].cnt > 0) {
    throw new Error(`该用户还有 ${borrowRows[0].cnt} 本书未归还，无法删除`);
  }

  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM users WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}

// ─── 获取用户借阅统计 ────────────────────────────────
export async function getUserBorrowStats(userId: number): Promise<UserBorrowStats> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       COUNT(*) AS totalBorrows,
       SUM(CASE WHEN status = 'borrowed' THEN 1 ELSE 0 END) AS currentBorrows,
       SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) AS overdueBorrows,
       SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) AS returnedBorrows
     FROM borrow_records
     WHERE user_id = ?`,
    [userId]
  );

  return {
    totalBorrows: Number(rows[0].totalBorrows) ?? 0,
    currentBorrows: Number(rows[0].currentBorrows) ?? 0,
    overdueBorrows: Number(rows[0].overdueBorrows) ?? 0,
    returnedBorrows: Number(rows[0].returnedBorrows) ?? 0,
  };
}

// ─── 分页查询用户 ────────────────────────────────────
export async function getUsersPaginated(
  page: number,
  pageSize: number,
  keyword?: string
): Promise<PaginatedResult<User>> {
  const offset = (page - 1) * pageSize;
  let countSql = 'SELECT COUNT(*) AS total FROM users';
  let querySql =
    'SELECT id, username, name, email, phone, role, status, created_at, updated_at FROM users';
  const params: any[] = [];

  if (keyword) {
    const like = `%${keyword}%`;
    const where =
      ' WHERE username LIKE ? OR name LIKE ? OR email LIKE ? OR phone LIKE ?';
    countSql += where;
    querySql += where;
    params.push(like, like, like, like);
  }

  querySql += ' ORDER BY id ASC LIMIT ? OFFSET ?';

  const [countRows] = await pool.execute<RowDataPacket[]>(countSql, params);
  const total = countRows[0].total;

  const [rows] = await pool.query<RowDataPacket[]>(querySql, [
    ...params,
    pageSize,
    offset,
  ]);

  return {
    data: rows as User[],
    total,
    page,
    pageSize,
  };
}
