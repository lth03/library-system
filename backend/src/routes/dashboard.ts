import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { updateOverdueStatus } from '../api/borrows/borrows.js';
import {
  getDashboardStats,
  getDailyTrend,
  getHotBooks,
  getOverdueList,
} from '../api/dashboard/dashboard.js';

const router = Router();

// 所有仪表盘路由都需要登录
router.use(authMiddleware);

// ─── GET /api/dashboard - 获取仪表盘完整数据 ────────
router.get('/', async (req, res) => {
  try {
    // 先更新逾期状态，保证统计数据准确
    await updateOverdueStatus();

    // 普通用户只能看自己的统计和逾期数据
    const userId = req.user?.role !== 'admin' ? req.user!.id : undefined;

    const [stats, trend, hotBooks, overdueList] = await Promise.all([
      getDashboardStats(userId),
      getDailyTrend(),
      getHotBooks(),
      getOverdueList(userId),
    ]);

    res.json({
      success: true,
      data: { stats, trend, hotBooks, overdueList },
    });
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
    res.status(500).json({ success: false, message: '获取仪表盘数据失败' });
  }
});

export default router;
