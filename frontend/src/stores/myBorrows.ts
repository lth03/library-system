import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api/login';
import type { ApiResponse, BorrowRecord } from '@/config/Interface';

export const useMyBorrowsStore = defineStore('myBorrows', () => {
  // ─── 状态 ────────────────────────────────────
  /** 当前用户的借阅记录 */
  const records = ref<BorrowRecord[]>([]);
  /** 加载中 */
  const loading = ref(false);
  /** 总记录数 */
  const total = ref(0);
  /** 当前页码 */
  const currentPage = ref(1);
  /** 每页条数 */
  const pageSize = 10;

  // ─── 计算属性 ──────────────────────────────
  /** 总页数 */
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));

  // ─── 列表 ────────────────────────────────
  /** 加载当前用户的借阅记录 GET /borrows/my */
  async function loadRecords() {
    loading.value = true;
    try {
      const res = await api.get<ApiResponse<{ data: BorrowRecord[]; total: number }>>('/borrows/my', {
        params: { page: currentPage.value, pageSize },
      });
      if (res.data.success) {
        records.value = res.data.data!.data;
        total.value = res.data.data!.total;
      }
    } catch { /* ignore */ } finally { loading.value = false; }
  }
  /** 跳转到指定页码 */
  function goPage(p: number) { if (p >= 1 && p <= totalPages.value) { currentPage.value = p; loadRecords(); } }

  // ─── 还书 / 续借 ──────────────────────────
  /** 还书（管理员操作用户记录） */
  async function returnBorrow(id: number) {
    const res = await api.put<ApiResponse<null>>(`/borrows/${id}/return`);
    if (res.data.success) await loadRecords();
    return res.data;
  }
  /** 续借（管理员操作用户记录） */
  async function renewBorrow(id: number, due_date: string) {
    const res = await api.put<ApiResponse<null>>(`/borrows/${id}/renew`, { due_date });
    if (res.data.success) await loadRecords();
    return res.data;
  }

  /** 还书（含确认） */
  async function confirmReturn(r: BorrowRecord) {
    if (!confirm(`确定归还《${r.bookTitle}》吗？`)) return null;
    const res = await returnBorrow(r.id);
    if (!res.success) alert(res.message);
    return res;
  }

  /** 续借（含确认 + 自动计算新日期） */
  async function confirmRenew(r: BorrowRecord) {
    const d = new Date(r.due_date);
    d.setDate(d.getDate() + 14);
    const due = d.toISOString().slice(0, 10);
    if (!confirm(`续借《${r.bookTitle}》至 ${due} 吗？`)) return null;
    const res = await renewBorrow(r.id, due);
    if (!res.success) alert(res.message);
    return res;
  }

  return {
    records, loading, total, currentPage, pageSize, totalPages,
    loadRecords, goPage, returnBorrow, renewBorrow, confirmReturn, confirmRenew,
  };
});
