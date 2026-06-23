import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  getBooks,
  createBook as createBookApi,
  updateBook as updateBookApi,
} from '@/api/books';
import {
  getCategories,
  createCategory as createCategoryApi,
  updateCategory as updateCategoryApi,
  deleteCategoryApi,
} from '@/api/categories';
import type { BookInfo, Category } from '@/config/Interface';

export const useBooksStore = defineStore('books', () => {
  // ─── 状态 ────────────────────────────────────
  /** 图书列表 */
  const books = ref<BookInfo[]>([]);
  /** 加载中 */
  const loading = ref(false);
  /** 总记录数 */
  const total = ref(0);
  /** 当前页码 */
  const currentPage = ref(1);
  /** 每页条数 */
  const pageSize = 10;
  /** 搜索关键字 */
  const searchKeyword = ref('');
  /** 分类筛选 ID */
  const searchCategoryId = ref<number | ''>('');
  /** 分类列表（含编辑态字段） */
  const categories = ref<(Category & { editName?: string; editDesc?: string })[]>([]);

  // ─── 计算属性 ──────────────────────────────
  /** 总页数 */
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));

  // ─── 图书列表 ──────────────────────────────
  /** 加载图书列表（携带搜索/筛选/分页参数） */
  async function loadBooks() {
    loading.value = true;
    try {
      const res = await getBooks({
        page: currentPage.value,
        pageSize,
        keyword: searchKeyword.value || undefined,
        categoryId: searchCategoryId.value || undefined,
      });
      if (res.success) {
        const d = res.data! as any;
        // 兼容分页响应（{ data, total }）和全量响应（数组）
        if (d.data) {
          books.value = d.data as BookInfo[];
          total.value = d.total;
        } else {
          books.value = d as unknown as BookInfo[];
          total.value = books.value.length;
        }
      }
    } catch { /* ignore */ } finally {
      loading.value = false;
    }
  }

  // ─── 分类列表 ──────────────────────────────
  /** 加载分类列表 */
  async function loadCategories() {
    try {
      const res = await getCategories();
      if (res.success) {
        categories.value = (res.data || []).map((c) => ({
          ...c,
          editName: c.name,
          editDesc: c.description || '',
        }));
      }
    } catch { /* ignore */ }
  }

  // ─── 搜索/分页 ────────────────────────────
  /** 执行搜索（回到第一页） */
  function search() { currentPage.value = 1; loadBooks(); }
  /** 重置搜索条件并刷新 */
  function resetSearch() {
    searchKeyword.value = '';
    searchCategoryId.value = '';
    currentPage.value = 1;
    loadBooks();
  }
  /** 跳转到指定页码 */
  function goPage(page: number) {
    if (page < 1 || page > totalPages.value) return;
    currentPage.value = page;
    loadBooks();
  }

  // ─── 分类 CRUD ────────────────────────────
  /** 新增分类 */
  async function addCategory(name: string, sort: number) {
    await createCategoryApi({ name, sort_order: sort });
    await loadCategories();
  }
  /** 更新分类排序 */
  async function updateCategorySort(cat: Category & { sort_order: number }) {
    await updateCategoryApi(cat.id, { sort_order: cat.sort_order });
  }
  /** 更新分类名称 */
  async function updateCategoryName(cat: Category & { editName: string }) {
    await updateCategoryApi(cat.id, { name: cat.editName });
    cat.name = cat.editName;
  }
  /** 更新分类描述 */
  async function updateCategoryDesc(cat: Category & { editDesc: string }) {
    await updateCategoryApi(cat.id, { description: cat.editDesc || undefined });
    cat.description = cat.editDesc;
  }
  /** 删除分类（含确认 + 保护检查） */
  async function deleteCategory(cat: Category) {
    if (!confirm(`确定删除分类「${cat.name}」吗？`)) return;
    const res = await deleteCategoryApi(cat.id);
    if (res.success) {
      await loadCategories();
      await loadBooks();
    } else {
      alert(res.message);
    }
  }

  // ─── 图书 CRUD ────────────────────────────
  /** 创建图书 */
  async function createBook(data: Parameters<typeof createBookApi>[0]) {
    const res = await createBookApi(data);
    if (res.success) await loadBooks();
    return res;
  }
  /** 更新图书信息 */
  async function updateBook(id: number, data: Parameters<typeof updateBookApi>[1]) {
    const res = await updateBookApi(id, data);
    if (res.success) await loadBooks();
    return res;
  }
  /** 切换图书上架/下架状态 */
  async function toggleStatus(book: BookInfo) {
    const newStatus = book.status === 1 ? 0 : 1;
    if (!confirm(`确定${newStatus === 1 ? '上架' : '下架'}《${book.title}》吗？`)) return;
    await updateBook(book.id, { status: newStatus });
  }

  // ─── 表单状态 ────────────────────────────
  /** 提交中 */
  const submitting = ref(false);
  /** 表单错误信息 */
  const formError = ref('');

  /** 提交图书表单（新增/编辑，含 loading + 错误处理） */
  async function submitBook(editingBook: BookInfo | null, data: any) {
    if (!data) { formError.value = '请完善表单信息'; return null; }
    submitting.value = true;
    formError.value = '';
    try {
      const res = editingBook
        ? await updateBook(editingBook.id, data)
        : await createBook(data);
      if (!res.success) formError.value = res.message;
      return res;
    } catch (e: any) {
      formError.value = e?.response?.data?.message || '提交失败';
      return null;
    } finally { submitting.value = false; }
  }

  // ─── 初始化 ──────────────────────────────
  /** 加载图书 + 分类 */
  function init() { loadCategories(); loadBooks(); }

  return {
    // 状态
    books, loading, total, currentPage, pageSize,
    searchKeyword, searchCategoryId,
    categories,
    // 计算
    totalPages,
    // 动作
    loadBooks, loadCategories,
    search, resetSearch, goPage,
    addCategory, updateCategorySort, updateCategoryName, updateCategoryDesc, deleteCategory,
    createBook, updateBook, toggleStatus,
    submitting, formError, submitBook,
    init,
  };
});
