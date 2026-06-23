// ============================================================
// 图书馆管理系统 - 公共类型定义
// ============================================================

// ─── 用户 ──────────────────────────────────────────

/** 用户完整信息 */
export interface User {
  /** 用户ID（自增主键） */
  id: number;
  /** 用户名（唯一） */
  username: string;
  /** 密码（bcrypt 加密后的哈希值） */
  password: string;
  /** 真实姓名 */
  name: string;
  /** 邮箱 */
  email: string | null;
  /** 手机号 */
  phone: string | null;
  /** 角色：admin=管理员，user=普通用户 */
  role: 'admin' | 'user';
  /** 状态：1=启用，0=禁用 */
  status: number;
  /** 创建时间 */
  created_at: Date;
  /** 更新时间（自动更新） */
  updated_at: Date;
}

/** 创建用户时的请求参数 */
export interface CreateUserInput {
  /** 用户名（必填，3-50个字符） */
  username: string;
  /** 密码（必填，至少6个字符，明文传入，内部加密存储） */
  password: string;
  /** 真实姓名（必填） */
  name: string;
  /** 邮箱（选填） */
  email?: string;
  /** 手机号（选填） */
  phone?: string;
  /** 角色（选填，默认为 'user'） */
  role?: 'admin' | 'user';
}

/** 更新用户时的请求参数（所有字段均为可选，仅传入需要修改的字段） */
export interface UpdateUserInput {
  /** 真实姓名 */
  name?: string;
  /** 邮箱 */
  email?: string;
  /** 手机号 */
  phone?: string;
  /** 角色 */
  role?: 'admin' | 'user';
  /** 状态：1=启用，0=禁用 */
  status?: number;
}

// ─── 图书分类 ──────────────────────────────────────

/** 图书分类完整信息 */
export interface Category {
  /** 分类ID（自增主键） */
  id: number;
  /** 分类名称（唯一） */
  name: string;
  /** 分类描述 */
  description: string | null;
  /** 排序权重（数字越小越靠前） */
  sort_order: number;
  /** 创建时间 */
  created_at: Date;
  /** 更新时间 */
  updated_at: Date;
}

/** 创建分类时的请求参数 */
export interface CreateCategoryInput {
  /** 分类名称（必填，唯一） */
  name: string;
  /** 分类描述（选填） */
  description?: string;
  /** 排序权重（选填，默认为0） */
  sort_order?: number;
}

/** 更新分类时的请求参数（所有字段均为可选） */
export interface UpdateCategoryInput {
  /** 分类名称 */
  name?: string;
  /** 分类描述 */
  description?: string;
  /** 排序权重 */
  sort_order?: number;
}

// ─── 图书 ──────────────────────────────────────────

/** 图书完整信息 */
export interface Book {
  /** 图书ID（自增主键） */
  id: number;
  /** ISBN 编号（唯一） */
  isbn: string;
  /** 书名 */
  title: string;
  /** 作者 */
  author: string;
  /** 出版社 */
  publisher: string | null;
  /** 出版年份 */
  publish_year: number | null;
  /** 所属分类ID */
  category_id: number | null;
  /** 图书简介 */
  description: string | null;
  /** 封面图片URL */
  cover_url: string | null;
  /** 馆藏总数 */
  total_count: number;
  /** 当前可借数量 */
  available_count: number;
  /** 状态：1=上架，0=下架 */
  status: number;
  /** 创建时间 */
  created_at: Date;
  /** 更新时间 */
  updated_at: Date;
}

/** 创建图书时的请求参数 */
export interface CreateBookInput {
  /** ISBN编号（必填，唯一） */
  isbn: string;
  /** 书名（必填） */
  title: string;
  /** 作者（必填） */
  author: string;
  /** 出版社（选填） */
  publisher?: string;
  /** 出版年份（选填） */
  publish_year?: number;
  /** 所属分类ID（选填） */
  category_id?: number;
  /** 图书简介（选填） */
  description?: string;
  /** 封面图片URL（选填） */
  cover_url?: string;
  /** 馆藏总数（选填，默认为1） */
  total_count?: number;
  /** 可借数量（选填，默认为1） */
  available_count?: number;
}

/** 更新图书时的请求参数（所有字段均为可选） */
export interface UpdateBookInput {
  /** 书名 */
  title?: string;
  /** 作者 */
  author?: string;
  /** 出版社 */
  publisher?: string;
  /** 出版年份 */
  publish_year?: number;
  /** 所属分类ID */
  category_id?: number;
  /** 图书简介 */
  description?: string;
  /** 封面图片URL */
  cover_url?: string;
  /** 馆藏总数 */
  total_count?: number;
  /** 可借数量 */
  available_count?: number;
  /** 状态：1=上架，0=下架 */
  status?: number;
}

// ─── 借阅记录 ──────────────────────────────────────

/** 借阅记录完整信息 */
export interface BorrowRecord {
  /** 记录ID（自增主键） */
  id: number;
  /** 借阅用户ID */
  user_id: number;
  /** 借阅图书ID */
  book_id: number;
  /** 借书日期 */
  borrow_date: Date;
  /** 应还日期 */
  due_date: Date;
  /** 实际归还日期（未还时为 null） */
  return_date: Date | null;
  /** 借阅状态：borrowed=借阅中，returned=已归还，overdue=逾期未还 */
  status: 'borrowed' | 'returned' | 'overdue';
  /** 续借次数 */
  renew_count: number;
  /** 创建时间 */
  created_at: Date;
  /** 更新时间 */
  updated_at: Date;
}

/** 创建借阅记录时的请求参数 */
export interface CreateBorrowInput {
  /** 借阅用户ID（必填） */
  user_id: number;
  /** 借阅图书ID（必填） */
  book_id: number;
  /** 应还日期（必填） */
  due_date: Date;
}

/** 更新借阅记录时的请求参数（所有字段均为可选） */
export interface UpdateBorrowInput {
  /** 实际归还日期 */
  return_date?: Date;
  /** 借阅状态 */
  status?: 'borrowed' | 'returned' | 'overdue';
  /** 续借次数 */
  renew_count?: number;
}

// ─── 借阅统计 ──────────────────────────────────────

/** 用户借阅统计数据 */
export interface UserBorrowStats {
  /** 总借阅次数 */
  totalBorrows: number;
  /** 当前借阅中的数量 */
  currentBorrows: number;
  /** 逾期未还的数量 */
  overdueBorrows: number;
  /** 已归还的数量 */
  returnedBorrows: number;
}

// ─── 分页结果 ──────────────────────────────────────

/** 通用分页查询结果（泛型） */
export interface PaginatedResult<T> {
  /** 当前页的数据列表 */
  data: T[];
  /** 符合条件的数据总数 */
  total: number;
  /** 当前页码（从1开始） */
  page: number;
  /** 每页大小 */
  pageSize: number;
}
