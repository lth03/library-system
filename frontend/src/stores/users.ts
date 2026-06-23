import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  getUsers,
  createUser as createUserApi,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
  resetPassword as resetPasswordApi,
  getUserBorrowStats,
} from '@/api/users';
import type { UserInfo } from '@/config/Interface';

export const useUsersStore = defineStore('users', () => {
  // ─── 状态 ────────────────────────────────────
  /** 用户列表 */
  const users = ref<UserInfo[]>([]);
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

  // ─── 计算属性 ──────────────────────────────
  /** 总页数 */
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));

  // ─── 用户列表 ──────────────────────────────
  /** 加载用户列表（携带搜索/分页） */
  async function loadUsers() {
    loading.value = true;
    try {
      const res = await getUsers({ page: currentPage.value, pageSize, keyword: searchKeyword.value || undefined });
      if (res.success) {
        const d = res.data! as any;
        // 兼容分页响应（{ data, total }）和全量响应（数组）
        if (d.data) {
          users.value = d.data as UserInfo[];
          total.value = d.total;
        } else {
          users.value = d as unknown as UserInfo[];
          total.value = users.value.length;
        }
      }
    } catch { /* ignore */ } finally { loading.value = false; }
  }

  /** 执行搜索（回到第一页） */
  function search() { currentPage.value = 1; loadUsers(); }
  /** 跳转到指定页码 */
  function goPage(p: number) { if (p >= 1 && p <= totalPages.value) { currentPage.value = p; loadUsers(); } }

  // ─── 用户 CRUD ────────────────────────────
  /** 创建用户 */
  async function createUser(data: Parameters<typeof createUserApi>[0]) {
    const res = await createUserApi(data);
    if (res.success) await loadUsers();
    return res;
  }
  /** 更新用户信息 */
  async function updateUser(id: number, data: Parameters<typeof updateUserApi>[1]) {
    const res = await updateUserApi(id, data);
    if (res.success) await loadUsers();
    return res;
  }
  /** 删除用户 */
  async function deleteUser(id: number) {
    try {
      const res = await deleteUserApi(id);
      if (res.success) await loadUsers();
      return res;
    } catch (e: any) {
      return { success: false as const, message: e?.response?.data?.message || '删除失败', data: null };
    }
  }
  /** 重置用户密码 */
  async function resetPassword(id: number, password: string) {
    return await resetPasswordApi(id, password);
  }

  // ─── 表单状态 ────────────────────────────
  /** 提交中 */
  const submitting = ref(false);
  /** 表单错误信息 */
  const formError = ref('');

  /** 删除操作错误提示 */
  const deleteError = ref('');

  /** 提交用户表单（新增/编辑，含 loading + 错误处理） */
  async function submitUser(editingUser: UserInfo | null, data: any) {
    submitting.value = true;
    formError.value = '';
    try {
      const res = editingUser
        ? await updateUser(editingUser.id, { name: data.name, email: data.email || undefined, phone: data.phone || undefined, role: data.role })
        : await createUser({ username: data.username, password: data.password, name: data.name, email: data.email || undefined, phone: data.phone || undefined, role: data.role });
      if (!res.success) formError.value = res.message;
      return res;
    } catch (e: any) {
      formError.value = e?.response?.data?.message || '操作失败';
      return null;
    } finally { submitting.value = false; }
  }

  /** 切换用户启用/禁用状态（含确认） */
  async function toggleUserStatus(u: UserInfo) {
    const newStatus = u.status === 1 ? 0 : 1;
    if (!confirm(`确定${newStatus === 1 ? '启用' : '禁用'}用户「${u.name}」吗？`)) return;
    await updateUser(u.id, { status: newStatus });
  }

  /** 重置用户密码（含确认） */
  async function resetUserPassword(u: UserInfo) {
    const pwd = prompt(`请输入「${u.name}」的新密码（至少6位）：`);
    if (!pwd || pwd.length < 6) { alert('密码长度不能少于6位'); return; }
    const res = await resetPasswordApi(u.id, pwd);
    if (res.success) alert('密码重置成功');
    else alert(res.message);
  }

  /** 删除用户（含确认） */
  async function confirmDeleteUser(u: UserInfo) {
    if (!confirm(`确定删除用户「${u.name}」吗？此操作不可恢复！`)) return;
    deleteError.value = '';
    const res = await deleteUser(u.id);
    if (!res.success) {
      alert(res.message);
    }
  }

  return {
    users, loading, total, currentPage, pageSize, searchKeyword, totalPages,
    loadUsers, search, goPage, createUser, updateUser, deleteUser, resetPassword, getUserBorrowStats,
    submitting, formError, deleteError, submitUser, toggleUserStatus, resetUserPassword, confirmDeleteUser,
  };
});
