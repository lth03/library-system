import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserByUsername } from '../operateUser/operateUser.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ─── POST /api/login - 用户登录 ────────────────────
router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 参数校验role
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码为必填项',
      });
    }

    // 查找用户（含密码字段）
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误',
      });
    }

    // 检查用户状态
    if (user.status === 0) {
      return res.status(403).json({
        success: false,
        message: '账号已被禁用，请联系管理员',
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误',
      });
    }

    // 生成 JWT 
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    // 返回 token 和用户信息（不含密码）
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        token,
        user: userWithoutPassword,
      },
      message: '登录成功',
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ success: false, message: '登录失败' });
  }
});

export default router;
