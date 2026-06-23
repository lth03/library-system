import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

// 信任 Nginx 反代，获取真实客户端 IP
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;

// ─── 中间件 ────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 速率限制：10 秒内超过 100 次则封禁 1 分钟
const rateLimitStore = new Map<string, { count: number; windowStart: number; blockedUntil: number }>();

app.use((req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let entry = rateLimitStore.get(ip);

  if (!entry) {
    entry = { count: 0, windowStart: now, blockedUntil: 0 };
    rateLimitStore.set(ip, entry);
  }

  if (entry.blockedUntil > now) {
    return res.status(429).json({ success: false, message: '请求过于频繁，请 1 分钟后再试' });
  }

  if (now - entry.windowStart > 10000) {
    entry.count = 0;
    entry.windowStart = now;
  }

  entry.count++;

  if (entry.count > 100) {
    entry.blockedUntil = now + 60000;
    return res.status(429).json({ success: false, message: '请求过于频繁，请 1 分钟后再试' });
  }

  next();
});

// ─── 路由 ──────────────────────────────────────────
import userRoutes from './routes/users.js';
import bookRoutes from './routes/books.js';
import loginRoutes from './api/Login/login.js';
import logoutRoutes from './api/Login/logout.js';
import dashboardRoutes from './routes/dashboard.js';
import categoryRoutes from './routes/categories.js';
import borrowRoutes from './routes/borrows.js';

app.get('/', (_req, res) => {
  res.json({ message: 'Library API is running 🚀' });
});

app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/logout', logoutRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/borrows', borrowRoutes);
// 借阅路由
app.use('/api/borrows', borrowRoutes);

// ─── 启动服务器 ────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
