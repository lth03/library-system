import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import {
  getBorrowsPaginated,
  getBorrowsByUser,
  getBorrowById,
  createBorrow,
  returnBook,
  renewBorrow,
} from '../api/borrows/borrows.js';
import { getBookById, updateAvailableCount } from '../api/operateBooks/operateBooks.js';
import { getUserById } from '../api/operateUser/operateUser.js';

const router = Router();

router.use(authMiddleware);

// ─── GET /api/borrows - 借阅记录列表（管理员）───
router.get('/', adminMiddleware, async (_req, res) => {
  try {
    const { page = '1', pageSize = '10', keyword, status } = _req.query as Record<string, string>;
    const result = await getBorrowsPaginated(Number(page), Number(pageSize), keyword, status);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('获取借阅记录失败:', error);
    res.status(500).json({ success: false, message: '获取借阅记录失败' });
  }
});

// ─── GET /api/borrows/my - 当前用户的借阅记录 ────
router.get('/my', async (req, res) => {
  try {
    const { page = '1', pageSize = '10', status } = req.query as Record<string, string>;
    const result = await getBorrowsByUser(req.user!.id, Number(page), Number(pageSize), status);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('获取我的借阅失败:', error);
    res.status(500).json({ success: false, message: '获取借阅记录失败' });
  }
});

// ─── GET /api/borrows/:id - 借阅详情 ──────────────
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: '无效的记录ID' });
    const record = await getBorrowById(id);
    if (!record) return res.status(404).json({ success: false, message: '记录不存在' });
    res.json({ success: true, data: record });
  } catch (error) {
    console.error('获取借阅详情失败:', error);
    res.status(500).json({ success: false, message: '获取借阅详情失败' });
  }
});

// ─── POST /api/borrows - 借书（管理员）────────────
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { user_id, book_id, due_date } = req.body;
    if (!user_id || !book_id || !due_date) {
      return res.status(400).json({ success: false, message: '用户、图书和应还日期为必填项' });
    }

    const user = await getUserById(user_id);
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });
    if (user.status === 0) return res.status(400).json({ success: false, message: '用户已被禁用' });

    const book = await getBookById(book_id);
    if (!book) return res.status(404).json({ success: false, message: '图书不存在' });
    if (book.status === 0) return res.status(400).json({ success: false, message: '图书已下架' });
    if (book.available_count <= 0) return res.status(400).json({ success: false, message: '图书已无可借数量' });

    const recordId = await createBorrow(user_id, book_id, due_date);
    await updateAvailableCount(book_id, -1);

    const record = await getBorrowById(recordId);
    res.status(201).json({ success: true, data: record, message: '借书成功' });
  } catch (error) {
    console.error('借书失败:', error);
    res.status(500).json({ success: false, message: '借书失败' });
  }
});

// ─── PUT /api/borrows/:id/return - 还书（管理员）──
router.put('/:id/return', adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: '无效的记录ID' });

    const record = await getBorrowById(id);
    if (!record) return res.status(404).json({ success: false, message: '记录不存在' });
    if (record.status === 'returned') return res.status(400).json({ success: false, message: '该书已归还' });

    await returnBook(id);
    await updateAvailableCount(record.book_id, 1);

    const updated = await getBorrowById(id);
    res.json({ success: true, data: updated, message: '还书成功' });
  } catch (error) {
    console.error('还书失败:', error);
    res.status(500).json({ success: false, message: '还书失败' });
  }
});

// ─── PUT /api/borrows/:id/renew - 续借（管理员）───
router.put('/:id/renew', adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: '无效的记录ID' });

    const { due_date } = req.body;
    if (!due_date) return res.status(400).json({ success: false, message: '新应还日期为必填项' });

    const record = await getBorrowById(id);
    if (!record) return res.status(404).json({ success: false, message: '记录不存在' });
    if (record.status === 'returned') return res.status(400).json({ success: false, message: '该书已归还，无法续借' });

    await renewBorrow(id, due_date);
    const updated = await getBorrowById(id);
    res.json({ success: true, data: updated, message: '续借成功' });
  } catch (error) {
    console.error('续借失败:', error);
    res.status(500).json({ success: false, message: '续借失败' });
  }
});

export default router;
