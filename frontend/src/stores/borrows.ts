import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api/login';
import { getBorrows, createBorrow, returnBorrow, renewBorrow } from '@/api/borrows';
import type { BorrowRecord } from '@/config/Interface';

export const useBorrowsStore = defineStore('borrows', () => {
  // ─── 状态 ────────────────────────────────────
  /** 借阅记录列表 */
  const records = ref<BorrowRecord[]>([]);
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
  /** 状态筛选（空=全部） */
  const searchStatus = ref('');

  // ─── 计算属性 ──────────────────────────────
  /** 总页数 */
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));

  // ─── 借阅列表 ──────────────────────────────
  /** 加载借阅记录列表（携带搜索/筛选/分页） */
  async function loadRecords() {
    loading.value = true;
    try {
      const res = await getBorrows({
        page: currentPage.value,
        pageSize,
        keyword: searchKeyword.value || undefined,
        status: searchStatus.value || undefined,
      });
      if (res.success) {
        records.value = res.data!.data;
        total.value = res.data!.total;
      }
    } catch { /* ignore */ } finally { loading.value = false; }
  }

  /** 执行搜索（回到第一页） */
  function search() { currentPage.value = 1; loadRecords(); }
  /** 重置搜索条件并刷新 */
  function resetSearch() { searchKeyword.value = ''; searchStatus.value = ''; search(); }
  /** 跳转到指定页码 */
  function goPage(p: number) {
    if (p < 1 || p > totalPages.value) return;
    currentPage.value = p;
    loadRecords();
  }

  // ─── 借/还/续 ──────────────────────────────
  /** 借书 */
  async function doBorrow(data: { user_id: number; book_id: number; due_date: string }) {
    const res = await createBorrow(data);
    if (res.success) await loadRecords();
    return res;
  }
  /** 还书 */
  async function doReturn(id: number) {
    const res = await returnBorrow(id);
    if (res.success) await loadRecords();
    return res;
  }
  /** 续借 */
  async function doRenew(id: number, due_date: string) {
    const res = await renewBorrow(id, due_date);
    if (res.success) await loadRecords();
    return res;
  }

  // ─── 操作状态（提交中 / 错误）────────────
  /** 提交中 */
  const submitting = ref(false);
  /** 操作错误信息 */
  const actionError = ref('');

  /** 执行借/还/续操作（含 loading + 错误处理） */
  async function execAction(mode: 'borrow' | 'return' | 'renew', recordId: number | null, data?: any) {
    submitting.value = true;
    actionError.value = '';
    try {
      let res;
      if (mode === 'borrow') res = await doBorrow(data);
      else if (mode === 'return') res = await doReturn(recordId!);
      else res = await doRenew(recordId!, data.due_date);
      if (!res!.success) actionError.value = res!.message;
      return res;
    } catch (e: any) {
      actionError.value = e?.response?.data?.message || '操作失败';
      return null;
    } finally { submitting.value = false; }
  }

  // ─── 借书弹窗 · 搜索 ──────────────────────
  /** 用户搜索关键字 */
  const userQuery = ref('');
  /** 用户搜索结果 */
  const userResults = ref<any[]>([]);
  /** 图书搜索关键字 */
  const bookQuery = ref('');
  /** 图书搜索结果 */
  const bookResults = ref<any[]>([]);
  /** 已选用户 ID */
  const selectedUserId = ref(0);
  /** 已选图书 ID */
  const selectedBookId = ref(0);
  /** 已选用户显示名 */
  const selectedUserName = ref('');
  /** 已选图书显示名 */
  const selectedBookTitle = ref('');

  let userTimer: ReturnType<typeof setTimeout> | null = null;
  let bookTimer: ReturnType<typeof setTimeout> | null = null;

  /** 防抖搜索用户 */
  async function searchUsers() {
    if (userTimer) clearTimeout(userTimer);
    userTimer = setTimeout(async () => {
      if (!userQuery.value) { userResults.value = []; return; }
      const res = await api.get('/users/search', { params: { keyword: userQuery.value } });
      if (res.data.success) userResults.value = res.data.data!;
    }, 200);
  }
  /** 防抖搜索图书 */
  async function searchBooks() {
    if (bookTimer) clearTimeout(bookTimer);
    bookTimer = setTimeout(async () => {
      if (!bookQuery.value) { bookResults.value = []; return; }
      const res = await api.get('/books/search', { params: { keyword: bookQuery.value } });
      if (res.data.success) bookResults.value = res.data.data!;
    }, 200);
  }
  /** 选中用户 */
  function pickUser(u: any) {
    selectedUserId.value = u.id;
    selectedUserName.value = `${u.name} (@${u.username})`;
    userQuery.value = ''; userResults.value = [];
  }
  /** 选中图书（可借数不足时忽略） */
  function pickBook(b: any) {
    if (b.available_count <= 0) return;
    selectedBookId.value = b.id;
    selectedBookTitle.value = `${b.title}（${b.author}）`;
    bookQuery.value = ''; bookResults.value = [];
  }
  /** 清空搜索 + 选中状态 */
  function clearSearch() {
    userQuery.value = ''; userResults.value = [];
    bookQuery.value = ''; bookResults.value = [];
    selectedUserId.value = 0; selectedUserName.value = '';
    selectedBookId.value = 0; selectedBookTitle.value = '';
  }
  /** 获取借书提交数据（未选完时返回 null） */
  function getBorrowPayload() {
    if (!selectedUserId.value || !selectedBookId.value) return null;
    return { user_id: selectedUserId.value, book_id: selectedBookId.value };
  }

  return {
    records, loading, total, currentPage, pageSize, searchKeyword, searchStatus, totalPages,
    loadRecords, search, resetSearch, goPage, doBorrow, doReturn, doRenew,
    submitting, actionError, execAction,
    userQuery, userResults, bookQuery, bookResults,
    selectedUserId, selectedBookId, selectedUserName, selectedBookTitle,
    searchUsers, searchBooks, pickUser, pickBook, clearSearch, getBorrowPayload,
  };
});
