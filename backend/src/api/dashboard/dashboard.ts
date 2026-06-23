// 这个文件包含了对仪表盘相关的数据库操作函数，包括获取统计数据、近7天借阅趋势、热门图书排行和逾期借阅详情等功能。

import pool from '../../config/database.js';
import type { RowDataPacket } from 'mysql2';

// ─── 仪表盘统计数据接口 ────────────────────────────
export interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  totalUsers: number;
  todayBorrows: number;
  todayReturns: number;
  overdueBooks: number;
}

// ─── 近7天借阅趋势 ────────────────────────────────
export interface DailyTrend {
  date: string;
  borrows: number;
  returns: number;
}

// ─── 热门图书排行 ──────────────────────────────────
export interface HotBook {
  id: number;
  title: string;
  author: string;
  borrowCount: number;
}

// ─── 逾期借阅详情 ──────────────────────────────────
export interface OverdueRecord {
  id: number;
  userName: string;
  bookTitle: string;
  borrowDate: string;
  dueDate: string;
  daysOverdue: number;
}

// ─── 仪表盘完整数据 ────────────────────────────────
export interface DashboardData {
  stats: DashboardStats;
  trend: DailyTrend[];
  hotBooks: HotBook[];
  overdueList: OverdueRecord[];
}

/**
 * 获取仪表盘统计数据
 * @param userId 可选，传入时逾期数量仅统计该用户
 */
export async function getDashboardStats(userId?: number): Promise<DashboardStats> {
  const [bookRows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       COUNT(*) AS totalBooks,
       SUM(available_count) AS availableBooks
     FROM books
     WHERE status = 1`
  );

  const [userRows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS totalUsers FROM users WHERE status = 1`
  );

  const [todayStr] = await pool.execute<RowDataPacket[]>(
    `SELECT CURDATE() AS today`
  );
  const today = (todayStr[0] as any).today as string;

  const [borrowRows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       SUM(CASE WHEN DATE(borrow_date) = ? THEN 1 ELSE 0 END) AS todayBorrows,
       SUM(CASE WHEN DATE(return_date) = ? THEN 1 ELSE 0 END) AS todayReturns
     FROM borrow_records`,
    [today, today]
  );

  let overdueSql = `SELECT COUNT(*) AS overdueBooks FROM borrow_records WHERE status = 'overdue'`;
  const overdueParams: any[] = [];
  if (userId !== undefined) {
    overdueSql += ' AND user_id = ?';
    overdueParams.push(userId);
  }
  const [overdueRows] = await pool.execute<RowDataPacket[]>(overdueSql, overdueParams);

  return {
    totalBooks: Number(bookRows[0].totalBooks) || 0,
    availableBooks: Number(bookRows[0].availableBooks) || 0,
    totalUsers: Number(userRows[0].totalUsers) || 0,
    todayBorrows: Number(borrowRows[0].todayBorrows) || 0,
    todayReturns: Number(borrowRows[0].todayReturns) || 0,
    overdueBooks: Number(overdueRows[0].overdueBooks) || 0,
  };
}

/**
 * 获取近7天借阅趋势
 */
export async function getDailyTrend(): Promise<DailyTrend[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       DATE(d.date) AS date,
       COALESCE(b.borrows, 0) AS borrows,
       COALESCE(r.returns, 0) AS returns
     FROM (
       SELECT CURDATE() - INTERVAL (n.num) DAY AS date
       FROM (
         SELECT 0 AS num UNION SELECT 1 UNION SELECT 2
         UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
       ) n
     ) d
     LEFT JOIN (
       SELECT DATE(borrow_date) AS dt, COUNT(*) AS borrows
       FROM borrow_records
       WHERE borrow_date >= CURDATE() - INTERVAL 6 DAY
       GROUP BY DATE(borrow_date)
     ) b ON d.date = b.dt
     LEFT JOIN (
       SELECT DATE(return_date) AS dt, COUNT(*) AS returns
       FROM borrow_records
       WHERE return_date >= CURDATE() - INTERVAL 6 DAY
       GROUP BY DATE(return_date)
     ) r ON d.date = r.dt
     ORDER BY d.date ASC`
  );

  return rows as DailyTrend[];
}

/**
 * 获取热门图书 TOP 10
 */
export async function getHotBooks(): Promise<HotBook[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       b.id,
       b.title,
       b.author,
       COUNT(br.id) AS borrowCount
     FROM borrow_records br
     JOIN books b ON br.book_id = b.id
     GROUP BY b.id, b.title, b.author
     ORDER BY borrowCount DESC
     LIMIT 10`
  );

  return rows as HotBook[];
}

/**
 * 获取逾期借阅列表
 * @param userId 可选，传入时只返回该用户的逾期记录
 */
export async function getOverdueList(userId?: number): Promise<OverdueRecord[]> {
  let sql = `SELECT
       br.id,
       u.name AS userName,
       b.title AS bookTitle,
       DATE_FORMAT(br.borrow_date, '%Y-%m-%d') AS borrowDate,
       DATE_FORMAT(br.due_date, '%Y-%m-%d') AS dueDate,
       DATEDIFF(CURDATE(), br.due_date) AS daysOverdue
     FROM borrow_records br
     JOIN users u ON br.user_id = u.id
     JOIN books b ON br.book_id = b.id
     WHERE br.status = 'overdue'`;
  const params: any[] = [];

  if (userId !== undefined) {
    sql += ' AND br.user_id = ?';
    params.push(userId);
  }

  sql += ' ORDER BY daysOverdue DESC';

  const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
  return rows as OverdueRecord[];
}
