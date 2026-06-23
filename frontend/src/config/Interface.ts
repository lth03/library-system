// ─── 通用 API 响应 ───────────────────────────────

/** 通用 API 响应包装 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

// ─── 分页 ────────────────────────────────────────

/** 分页请求参数 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  keyword?: string;
}

/** 通用分页响应（后端部分接口使用 list 字段） */
export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── 用户 ─────────────────────────────────────────

/** 用户信息 */
export interface UserInfo {
  id: number;
  username: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'admin' | 'user';
  status: number;
  created_at: string;
}

/** 登录请求参数 */
export interface LoginParams {
  username: string;
  password: string;
}

/** 登录响应数据 */
export interface LoginData {
  token: string;
  user: UserInfo;
}

/** 用户借阅统计 */
export interface UserBorrowStats {
  total: number;
  current: number;
  history: number;
}

/** 创建用户参数 */
export interface CreateUserParams {
  username: string;
  password: string;
  name: string;
  email?: string;
  phone?: string;
  role?: 'admin' | 'user';
}

/** 用户列表接口返回类型（分页 / 全量） */
export type UsersResponse = UserInfo[] | PaginatedData<UserInfo>;

// ─── 分类 ─────────────────────────────────────────

/** 图书分类 */
export interface Category {
  id: number;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** 创建分类参数 */
export interface CreateCategoryParams {
  name: string;
  description?: string;
  sort_order?: number;
}

/** 更新分类参数 */
export interface UpdateCategoryParams {
  name?: string;
  description?: string;
  sort_order?: number;
}

// ─── 图书 ─────────────────────────────────────────

/** 图书信息 */
export interface BookInfo {
  id: number;
  isbn: string;
  title: string;
  author: string;
  publisher: string | null;
  publish_year: number | null;
  category_id: number | null;
  category_name: string | null;
  description: string | null;
  cover_url: string | null;
  total_count: number;
  available_count: number;
  status: number;
  created_at: string;
  updated_at: string;
}

/** 图书分页响应（后端使用 data 字段） */
export interface PaginatedBooks {
  data: BookInfo[];
  total: number;
  page: number;
  pageSize: number;
}

/** 图书查询参数 */
export interface BookQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: number;
}

/** 创建图书参数 */
export interface CreateBookParams {
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  publish_year?: number;
  category_id?: number;
  description?: string;
  cover_url?: string;
  total_count?: number;
  available_count?: number;
}

/** 更新图书参数 */
export interface UpdateBookParams {
  title?: string;
  author?: string;
  publisher?: string;
  publish_year?: number;
  category_id?: number;
  description?: string;
  cover_url?: string;
  total_count?: number;
  available_count?: number;
  status?: number;
}

/** 图书列表接口返回类型（分页 / 全量） */
export type BooksResponse = BookInfo[] | PaginatedBooks;

// ─── 借阅记录 ─────────────────────────────────────

/** 借阅记录 */
export interface BorrowRecord {
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

/** 借阅记录分页响应 */
export interface PaginatedBorrows {
  data: BorrowRecord[];
  total: number;
  page: number;
  pageSize: number;
}

/** 借阅记录查询参数 */
export interface BorrowQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
}

/** 借书参数 */
export interface CreateBorrowParams {
  user_id: number;
  book_id: number;
  due_date: string;
}

// ─── 仪表盘 ───────────────────────────────────────

/** 仪表盘统计数字 */
export interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  totalUsers: number;
  todayBorrows: number;
  todayReturns: number;
  overdueBooks: number;
}

/** 每日借还趋势 */
export interface DailyTrend {
  date: string;
  borrows: number;
  returns: number;
}

/** 热门图书排行 */
export interface HotBook {
  id: number;
  title: string;
  author: string;
  borrowCount: number;
}

/** 逾期记录 */
export interface OverdueRecord {
  id: number;
  userName: string;
  bookTitle: string;
  borrowDate: string;
  dueDate: string;
  daysOverdue: number;
}

/** 仪表盘完整数据 */
export interface DashboardData {
  stats: DashboardStats;
  trend: DailyTrend[];
  hotBooks: HotBook[];
  overdueList: OverdueRecord[];
}
