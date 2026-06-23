import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { addToBlacklist } from '../tokenBlacklist.js';

const router = Router();

// 需要登录才能登出
router.use(authMiddleware);

// ─── POST /api/logout - 退出登录 ────────────────────
router.post('/', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  if (token) {
    addToBlacklist(token);
  }

  res.json({
    success: true,
    message: '退出登录成功',
  });
});

export default router;
