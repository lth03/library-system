import { Router } from 'express';
import {
  authMiddleware,
  adminMiddleware,
} from '../middleware/auth.js';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/categories/categories.js';
import { getBookCountByCategory } from '../api/operateBooks/operateBooks.js';

const router = Router();

// 所有分类路由都需要登录
router.use(authMiddleware);

// ─── GET /api/categories - 获取所有分类 ────────────
router.get('/', async (_req, res) => {
  try {
    const categories = await getAllCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({ success: false, message: '获取分类列表失败' });
  }
});

// ─── GET /api/categories/:id - 获取单个分类 ────────
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '无效的分类ID' });
    }

    const category = await getCategoryById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: '分类不存在' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({ success: false, message: '获取分类失败' });
  }
});

// ─── POST /api/categories - 创建分类 ───────────────
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { name, description, sort_order } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: '分类名称为必填项' });
    }

    const categoryId = await createCategory({ name, description, sort_order });
    const category = await getCategoryById(categoryId);
    res.status(201).json({ success: true, data: category, message: '分类创建成功' });
  } catch (error: any) {
    if (error.message === '分类名称已存在') {
      return res.status(409).json({ success: false, message: '分类名称已存在' });
    }
    console.error('创建分类失败:', error);
    res.status(500).json({ success: false, message: '创建分类失败' });
  }
});

// ─── PUT /api/categories/:id - 更新分类 ────────────
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '无效的分类ID' });
    }

    const { name, description, sort_order } = req.body;

    const updated = await updateCategory(id, { name, description, sort_order });
    if (!updated) {
      return res.status(404).json({ success: false, message: '分类不存在或无变更' });
    }

    const category = await getCategoryById(id);
    res.json({ success: true, data: category, message: '分类更新成功' });
  } catch (error) {
    console.error('更新分类失败:', error);
    res.status(500).json({ success: false, message: '更新分类失败' });
  }
});



// ─── DELETE /api/categories/:id - 删除分类 ─────────
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '无效的分类ID' });
    }

    // 检查分类下是否有图书
    const bookCount = await getBookCountByCategory(id);
    if (bookCount > 0) {
      return res.status(400).json({
        success: false,
        message: `该分类下有 ${bookCount} 本图书，无法删除`,
      });
    }

    const deleted = await deleteCategory(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: '分类不存在' });
    }

    res.json({ success: true, message: '分类删除成功' });
  } catch (error) {
    console.error('删除分类失败:', error);
    res.status(500).json({ success: false, message: '删除分类失败' });
  }
});

export default router;
