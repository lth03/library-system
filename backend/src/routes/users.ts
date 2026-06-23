import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import type { RowDataPacket } from 'mysql2';
import {
  authMiddleware,
  adminMiddleware,
} from '../middleware/auth.js';
import {
  getAllUsers,
  getUserById,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
  getUserBorrowStats,
  getUsersPaginated,
  updatePassword,
} from '../api/operateUser/operateUser.js';

const router = Router();

// 所有用户路由都需要登录
router.use(authMiddleware);

// ─── GET /api/users - 获取所有用户 ──────────────────
router.get('/', async (_req, res) => {
  try {
    const { page, pageSize, keyword } = _req.query;

    // 如果有分页参数，使用分页查询
    if (page && pageSize) {
      const result = await getUsersPaginated(
        Number(page),
        Number(pageSize),
        keyword as string | undefined
      );
      return res.json({ success: true, data: result });
    }

    const users = await getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ success: false, message: '获取用户列表失败' });
  }
});

// ─── GET /api/users/search - 精简用户搜索（借书用）─
router.get('/search', async (req, res) => {
  try {
    const { keyword = '' } = req.query as Record<string, string>;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, username FROM users WHERE status = 1 AND (name LIKE ? OR username LIKE ?) LIMIT 10`,
      [`%${keyword}%`, `%${keyword}%`]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('搜索用户失败:', error);
    res.status(500).json({ success: false, message: '搜索失败' });
  }
});

// ─── GET /api/users/:id - 获取单个用户 ──────────────
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '无效的用户ID' });
    }

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('获取用户失败:', error);
    res.status(500).json({ success: false, message: '获取用户失败' });
  }
});

// ─── GET /api/users/:id/stats - 获取用户借阅统计 ────
router.get('/:id/stats', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '无效的用户ID' });
    }

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    const stats = await getUserBorrowStats(id);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('获取用户借阅统计失败:', error);
    res.status(500).json({ success: false, message: '获取用户借阅统计失败' });
  }
});

// ─── POST /api/users - 创建用户 ─────────────────────
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { username, password, name, email, phone, role } = req.body;

    // 参数校验
    if (!username || !password || !name) {
      return res
        .status(400)
        .json({ success: false, message: '用户名、密码和姓名为必填项' });
    }

    if (username.length < 3 || username.length > 50) {
      return res
        .status(400)
        .json({ success: false, message: '用户名长度应为 3-50 个字符' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: '密码长度不能少于 6 个字符' });
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = await createUser({
      username,
      password: hashedPassword,
      name,
      email,
      phone,
      role,
    });

    const user = await getUserById(userId);
    res.status(201).json({ success: true, data: user, message: '用户创建成功' });
  } catch (error: any) {
    if (error.message === '用户名已存在') {
      return res.status(409).json({ success: false, message: '用户名已存在' });
    }
    console.error('创建用户失败:', error);
    res.status(500).json({ success: false, message: '创建用户失败' });
  }
});

// ─── PUT /api/users/password - 当前用户修改密码 ──
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: '旧密码和新密码为必填项' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: '新密码长度不能少于 6 个字符' });
    }

    const user = await getUserByUsername(req.user!.username);
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) return res.status(400).json({ success: false, message: '旧密码错误' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await updatePassword(req.user!.id, hashedPassword);

    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ success: false, message: '修改密码失败' });
  }
});

// ─── PUT /api/users/:id - 更新用户信息 ──────────────
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '无效的用户ID' });
    }

    const { name, email, phone, role, status } = req.body;

    const updated = await updateUser(id, { name, email, phone, role, status });
    if (!updated) {
      return res.status(404).json({ success: false, message: '用户不存在或无变更' });
    }

    const user = await getUserById(id);
    res.json({ success: true, data: user, message: '用户信息更新成功' });
  } catch (error) {
    console.error('更新用户失败:', error);
    res.status(500).json({ success: false, message: '更新用户失败' });
  }
});

// ─── DELETE /api/users/:id - 删除用户 ───────────────
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '无效的用户ID' });
    }

    // 禁止删除自己
    if (id === req.user!.id) {
      return res.status(400).json({ success: false, message: '不能删除自己的账号' });
    }

    const deleted = await deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    res.json({ success: true, message: '用户删除成功' });
  } catch (error: any) {
    // 将业务错误消息返回给前端（如：有未还书无法删除）
    const message = error.message || '删除用户失败';
    console.error('删除用户失败:', message);
    res.status(400).json({ success: false, message });
  }
});

// ─── PUT /api/users/:id/reset-password - 重置密码 ──
router.put('/:id/reset-password', adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: '无效的用户ID' });

    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: '密码长度不能少于 6 个字符' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updated = await updatePassword(id, hashedPassword);
    if (!updated) return res.status(404).json({ success: false, message: '用户不存在' });

    res.json({ success: true, message: '密码重置成功' });
  } catch (error) {
    console.error('重置密码失败:', error);
    res.status(500).json({ success: false, message: '重置密码失败' });
  }
});

export default router;
