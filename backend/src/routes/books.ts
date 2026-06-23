import { Router } from 'express';
import pool from '../config/database.js';
import type { RowDataPacket } from 'mysql2';
import {
  authMiddleware,
  adminMiddleware,
} from '../middleware/auth.js';
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBooksPaginated,
} from '../api/operateBooks/operateBooks.js';

const router = Router();

// 所有图书路由都需要登录
router.use(authMiddleware);

// ─── GET /api/books - 获取所有图书 ──────────────────
router.get('/', async (_req, res) => {
  try {
    const { page, pageSize, keyword, categoryId } = _req.query;

    // 如果有分页参数，使用分页查询
    if (page && pageSize) {
      const result = await getBooksPaginated(
        Number(page),
        Number(pageSize),
        keyword as string | undefined,
        categoryId ? Number(categoryId) : undefined
      );
      return res.json({ success: true, data: result });
    }

    const books = await getAllBooks();
    res.json({ success: true, data: books });
  } catch (error) {
    console.error('获取图书列表失败:', error);
    res.status(500).json({ success: false, message: '获取图书列表失败' });
  }
});

// ─── GET /api/books/search - 精简图书搜索（借书用）─
router.get('/search', async (req, res) => {
  try {
    const { keyword = '' } = req.query as Record<string, string>;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, title, author, available_count FROM books
       WHERE status = 1 AND (title LIKE ? OR author LIKE ?)
       LIMIT 10`,
      [`%${keyword}%`, `%${keyword}%`]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('搜索图书失败:', error);
    res.status(500).json({ success: false, message: '搜索失败' });
  }
});

// ─── GET /api/books/:id - 获取单个图书 ──────────────
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '无效的图书ID' });
    }

    const book = await getBookById(id);
    if (!book) {
      return res.status(404).json({ success: false, message: '图书不存在' });
    }

    res.json({ success: true, data: book });
  } catch (error) {
    console.error('获取图书失败:', error);
    res.status(500).json({ success: false, message: '获取图书失败' });
  }
});

// ─── POST /api/books - 创建图书 ─────────────────────
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const {
      isbn,
      title,
      author,
      publisher,
      publish_year,
      category_id,
      description,
      cover_url,
      total_count,
      available_count,
    } = req.body;

    // 参数校验
    if (!isbn || !title || !author) {
      return res
        .status(400)
        .json({ success: false, message: 'ISBN、书名和作者为必填项' });
    }

    const bookId = await createBook({
      isbn,
      title,
      author,
      publisher,
      publish_year,
      category_id,
      description,
      cover_url,
      total_count,
      available_count,
    });

    const book = await getBookById(bookId);
    res.status(201).json({ success: true, data: book, message: '图书创建成功' });
  } catch (error: any) {
    if (error.message === 'ISBN 已存在') {
      return res.status(409).json({ success: false, message: 'ISBN 已存在' });
    }
    console.error('创建图书失败:', error);
    res.status(500).json({ success: false, message: '创建图书失败' });
  }
});

// ─── PUT /api/books/:id - 更新图书信息 ──────────────
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '无效的图书ID' });
    }

    const {
      title,
      author,
      publisher,
      publish_year,
      category_id,
      description,
      cover_url,
      total_count,
      available_count,
      status,
    } = req.body;

    const updated = await updateBook(id, {
      title,
      author,
      publisher,
      publish_year,
      category_id,
      description,
      cover_url,
      total_count,
      available_count,
      status,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: '图书不存在或无变更' });
    }

    const book = await getBookById(id);
    res.json({ success: true, data: book, message: '图书信息更新成功' });
  } catch (error) {
    console.error('更新图书失败:', error);
    res.status(500).json({ success: false, message: '更新图书失败' });
  }
});

// ─── DELETE /api/books/:id - 删除图书 ───────────────
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: '无效的图书ID' });
    }

    const deleted = await deleteBook(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: '图书不存在' });
    }

    res.json({ success: true, message: '图书删除成功' });
  } catch (error: any) {
    const message = error.message || '删除图书失败';
    console.error('删除图书失败:', message);
    res.status(400).json({ success: false, message });
  }
});

export default router;
