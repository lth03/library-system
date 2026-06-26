# 📚 图书馆管理系统

基于 **Vue 3 + Express + MySQL** 的全栈图书馆管理平台，覆盖图书管理、借阅流转、用户权限控制及数据可视化。

## 📐 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Vue 3 + TS)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │   Views  │  │  Stores  │  │  Router  │  │ ECharts    │  │
│  │ (7 pages)│  │ (Pinia×9)│  │ (守卫×2) │  │ 图表×2     │  │
│  └────┬─────┘  └──────────┘  └──────────┘  └────────────┘  │
│       │ Axios (自动附带 JWT)                                 │
├───────┼─────────────────────────────────────────────────────┤
│       ▼                                                     │
│  Backend (Express + TS)  ─── 4 层架构                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Routes  │→│  API     │→│  Middle  │→│  DB Pool   │  │
│  │(5 files) │ │(7 mods)  │ │(auth/   │ │(mysql2×10)│  │
│  │ 28 端点  │ │          │ │ admin)  │ │           │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────┬──────┘  │
│                                                    │        │
└────────────────────────────────────────────────────┼────────┘
                                                     ▼
                                          ┌──────────────────┐
                                          │     MySQL 8      │
                                          │  4 张核心数据表   │
                                          │ users / books    │
                                          │ categories /     │
                                          │ borrow_records   │
                                          └──────────────────┘
```

## ✨ 功能特性

| 模块            | 功能点                                                                            | 权限                 |
| --------------- | --------------------------------------------------------------------------------- | -------------------- |
| **📊 仪表盘**   | 6 项统计卡片 + ECharts 借阅趋势折线图 + 热门图书柱状图 + 逾期列表                 | 全员                 |
| **📚 图书管理** | 分页列表、搜索（书名/作者/ISBN）、分类筛选、新增/编辑/上架下架                    | 全员查看，管理员操作 |
| **🗂️ 分类管理** | 分类 CRUD、排序调整、删除保护（有图书不可删）                                     | 管理员               |
| **📋 借阅管理** | 借书（搜索用户+搜索图书+设置日期）、还书（自动加可借数）、续借（+14天）、状态筛选 | 管理员               |
| **👤 我的借阅** | 查看个人记录、自助还书/续借                                                       | 普通用户             |
| **👥 用户管理** | 分页列表、搜索、CRUD、启用/禁用、重置密码、借阅统计                               | 管理员               |
| **🔑 个人中心** | 查看个人信息、修改密码（需当前密码验证）                                          | 全员                 |
| **🌙 深色模式** | 一键切换浅色/深色，持久化到 localStorage                                          | 全员                 |

## 🛠️ 技术栈

| 层级         | 技术                     | 用途              |
| ------------ | ------------------------ | ----------------- |
| **前端框架** | Vue 3 + TypeScript       | 页面组件          |
| **构建**     | Vite 8                   | 开发/构建         |
| **状态管理** | Pinia 3                  | 9 个 Store        |
| **路由**     | Vue Router 4             | 7 页面 + 2 层守卫 |
| **图表**     | ECharts 6 + vue-echarts  | 趋势图、柱状图    |
| **HTTP**     | Axios                    | 请求/响应拦截器   |
| **样式**     | Less                     | 深色/浅色主题变量 |
| **后端框架** | Express 5 + TypeScript 6 | REST API          |
| **数据库**   | MySQL 8 + mysql2         | 连接池（10 连接） |
| **认证**     | JWT (jsonwebtoken)       | Token 签发/校验   |
| **密码**     | bcryptjs                 | 哈希存储          |
| **安全**     | Helmet + CORS + 速率限制 | HTTP 头/跨域/限流 |

## 🗄️ 数据库设计

```
users (1) ──────< borrow_records >────── (1) books
  │                                        │
  │                                        │
  └────────────────────────────────────────┘
                   categories (1) ────< (N) books
```

| 表               | 主键 | 关键字段                                                                                             | 关联                     |
| ---------------- | ---- | ---------------------------------------------------------------------------------------------------- | ------------------------ |
| `users`          | id   | username, password(bcrypt), name, email, phone, role(admin/user), status(1/0)                        | -                        |
| `categories`     | id   | name(unique), description, sort_order                                                                | -                        |
| `books`          | id   | isbn(unique), title, author, publisher, category_id, total_count, available_count, status(1/0)       | FK→categories.id         |
| `borrow_records` | id   | user_id, book_id, borrow_date, due_date, return_date, status(borrowed/returned/overdue), renew_count | FK→users.id, FK→books.id |

## 📁 项目结构

```
├── backend/                        # 后端（Express + TS）
│   ├── src/
│   │   ├── index.ts                # 入口：中间件链 + 路由挂载
│   │   ├── config/
│   │   │   ├── database.ts         # MySQL 连接池（utf8mb4）
│   │   │   └── Interface.ts        # 全量 TS 类型定义
│   │   ├── middleware/
│   │   │   └── auth.ts             # JWT 校验 + 角色鉴权
│   │   ├── api/                    # 业务逻辑层
│   │   │   ├── Login/login.ts      # POST /api/login（bcrypt 验证 + JWT 签发）
│   │   │   ├── Login/logout.ts     # POST /api/logout（Token 加入黑名单）
│   │   │   ├── tokenBlacklist.ts   # 内存 Set 黑名单
│   │   │   ├── operateBooks/       # 图书 CRUD + 分页 + 搜索 + 可借数更新
│   │   │   ├── operateUser/        # 用户 CRUD + 分页 + 搜索 + 统计
│   │   │   ├── borrows/            # 借阅 CRUD + 逾期自动标记
│   │   │   ├── categories/         # 分类 CRUD
│   │   │   └── dashboard/          # 统计/近7日趋势/热门TOP10/逾期列表
│   │   └── routes/                 # 路由层（参数校验 + 错误处理）
│   │       ├── books.ts            # 6 端点
│   │       ├── users.ts            # 9 端点（含修改密码/重置密码）
│   │       ├── borrows.ts          # 6 端点（借/还/续/列表/详情/我的）
│   │       ├── categories.ts       # 4 端点
│   │       └── dashboard.ts        # 1 端点（聚合 4 类数据）
│   ├── .env                        # DB/JWT 配置
│   └── package.json
│
├── frontend/                       # 前端（Vue 3 + TS）
│   ├── src/
│   │   ├── main.ts                 # 入口：Pinia + Router + 全局样式
│   │   ├── App.vue                 # 根组件：<router-view />
│   │   ├── api/                    # Axios 实例（Token 拦截器 + 401 跳转）
│   │   │   ├── login.ts            # API 基础实例
│   │   │   ├── books.ts            # 图书 API
│   │   │   ├── users.ts            # 用户 API
│   │   │   ├── borrows.ts          # 借阅 API
│   │   │   ├── categories.ts       # 分类 API
│   │   │   ├── dashboard.ts        # 仪表盘 API
│   │   │   └── logOut.ts           # 登出 API
│   │   ├── stores/                 # Pinia 状态管理
│   │   │   ├── auth.ts             # Token/User + 登录/登出 + localStorage 持久化
│   │   │   ├── layout.ts           # 侧栏折叠 + 角色菜单（admin 5项 / user 4项）
│   │   │   ├── theme.ts            # 深色/浅色切换
│   │   │   ├── books.ts            # 图书列表 + 分类管理 + CRUD
│   │   │   ├── borrows.ts          # 借阅列表 + 借/还/续 + 借书弹窗搜索
│   │   │   ├── myBorrows.ts        # 个人借阅 + 自助还/续
│   │   │   ├── users.ts            # 用户列表 + CRUD + 启用禁用
│   │   │   ├── dashboard.ts        # 仪表盘数据加载
│   │   │   └── profile.ts          # 个人资料 + 修改密码
│   │   ├── router/index.ts         # 7 路由 + beforeEach 守卫
│   │   ├── config/Interface.ts     # 前端类型定义
│   │   └── views/
│   │       ├── LoginView/          # 登录页
│   │       ├── HomeView/           # 主页布局（顶栏 + 侧栏 + router-view）
│   │       └── mainViews/
│   │           ├── dashboard/      # 仪表盘（StatsGrid + TrendChart + HotBookChart + OverdueTable）
│   │           ├── books/          # 图书管理（BookTable + BookFormModal + BookDetailModal + CategoryManager）
│   │           ├── borrows/        # 借阅管理（BorrowSearch + BorrowTable + BorrowActionModal + BorrowDetailModal）
│   │           ├── myBorrows/      # 我的借阅（BorrowTable + BorrowDetailModal）
│   │           ├── users/          # 用户管理（UserTable + UserFormModal + UserDetailModal）
│   │           └── profile/        # 个人中心
│   ├── vite.config.ts              # @ 别名 + proxy /api → :3000
│   └── package.json
│
└── 使用指南.md                     # MySQL 建表脚本 + 详细使用说明
```

## 🔌 完整 API 清单（28 端点）

| 方法   | 路径                            | 鉴权 | 管理员 | 说明                                  |
| ------ | ------------------------------- | :--: | :----: | ------------------------------------- |
| POST   | `/api/login`                    |  -   |   -    | 用户登录，返回 JWT                    |
| POST   | `/api/logout`                   |  ✅  |   -    | 登出，Token 加入黑名单                |
| GET    | `/api/dashboard`                |  ✅  |   -    | 仪表盘聚合数据（统计+趋势+热门+逾期） |
| GET    | `/api/books`                    |  ✅  |   -    | 图书列表（分页/搜索/分类筛选）        |
| GET    | `/api/books/search`             |  ✅  |   -    | 精简搜索（借书弹窗）                  |
| GET    | `/api/books/:id`                |  ✅  |   -    | 图书详情                              |
| POST   | `/api/books`                    |  ✅  |   ✅   | 新增图书                              |
| PUT    | `/api/books/:id`                |  ✅  |   ✅   | 更新图书                              |
| DELETE | `/api/books/:id`                |  ✅  |   ✅   | 删除图书（有未还记录不可删）          |
| GET    | `/api/categories`               |  ✅  |   -    | 分类列表（按排序）                    |
| POST   | `/api/categories`               |  ✅  |   ✅   | 新增分类                              |
| PUT    | `/api/categories/:id`           |  ✅  |   ✅   | 更新分类                              |
| DELETE | `/api/categories/:id`           |  ✅  |   ✅   | 删除分类（有图书不可删）              |
| GET    | `/api/borrows`                  |  ✅  |   ✅   | 借阅记录（分页/搜索/状态筛选）        |
| GET    | `/api/borrows/my`               |  ✅  |   -    | 当前用户借阅记录                      |
| GET    | `/api/borrows/:id`              |  ✅  |   -    | 借阅详情                              |
| POST   | `/api/borrows`                  |  ✅  |   ✅   | 借书（扣减可借数）                    |
| PUT    | `/api/borrows/:id/return`       |  ✅  |   ✅   | 还书（增加可借数）                    |
| PUT    | `/api/borrows/:id/renew`        |  ✅  |   ✅   | 续借（延长应还日）                    |
| GET    | `/api/users`                    |  ✅  |   -    | 用户列表（分页/搜索）                 |
| GET    | `/api/users/search`             |  ✅  |   -    | 精简搜索（借书弹窗）                  |
| GET    | `/api/users/:id`                |  ✅  |   -    | 用户详情                              |
| GET    | `/api/users/:id/stats`          |  ✅  |   -    | 用户借阅统计                          |
| POST   | `/api/users`                    |  ✅  |   ✅   | 新增用户                              |
| PUT    | `/api/users/:id`                |  ✅  |   ✅   | 更新用户                              |
| DELETE | `/api/users/:id`                |  ✅  |   ✅   | 删除用户（禁止删自己+有未还书不可删） |
| PUT    | `/api/users/password`           |  ✅  |   -    | 自己修改密码                          |
| PUT    | `/api/users/:id/reset-password` |  ✅  |   ✅   | 管理员重置密码                        |

## 🚀 快速开始

### 前置条件

- Node.js >= 18
- MySQL >= 8.0
- npm

### 1. 数据库

执行 [`使用指南.md`](./使用指南.md) 中的 SQL 脚本创建数据库和表。

初始管理员账号：**admin** / **admin123**

### 2. 启动后端

```bash
cd backend
npm install
# 编辑 .env 配置数据库连接信息
npm run dev        # → http://localhost:3000
```

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev        # → http://localhost:5173
```

### 4. 使用

浏览器打开 `http://localhost:5173` → 自动跳转登录页 → 输入 **admin / admin123** 登录。

> 详细操作步骤请参阅 **[使用指南.md](./使用指南.md)**。

如果您愿意还可以使用docker包装的开箱即用：https://github.com/lth03/project
