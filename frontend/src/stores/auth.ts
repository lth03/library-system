import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { loginApi } from '@/api/login';
import { logoutApi } from '@/api/logOut';
import type { UserInfo, ApiResponse, LoginData } from '@/config/Interface';

/**
 * 认证状态管理
 *
 * 职责：
 *  - 维护 token 和用户信息的响应式状态
 *  - 提供 login / logout 方法
 *  - 状态持久化到 localStorage（刷新后恢复登录态）
 */
export const useAuthStore = defineStore('auth', () => {
  // ─── 状态 ────────────────────────────────────
  /** JWT token，从 localStorage 恢复 */
  const token = ref(localStorage.getItem('token') || '');
  /** 当前登录用户信息 */
  const user = ref<UserInfo | null>(
    JSON.parse(localStorage.getItem('user') || 'null')
  );

  // ─── 计算属性 ──────────────────────────────
  /** 是否已登录 */
  const isLoggedIn = computed(() => !!token.value);
  /** 是否为管理员 */
  const isAdmin = computed(() => user.value?.role === 'admin');
  /** 用户显示名称 */
  const userName = computed(() => user.value?.name || '');

  // ─── 登录表单 ──────────────────────────────
  /** 登录表单 - 用户名 */
  const loginUsername = ref('');
  /** 登录表单 - 密码 */
  const loginPassword = ref('');
  /** 登录表单 - 错误提示 */
  const loginError = ref('');
  /** 登录表单 - 提交中 */
  const loginLoading = ref(false);

  /** 提交登录表单，成功返回 true，失败返回 false */
  async function submitLogin() {
    loginError.value = '';
    if (!loginUsername.value) { loginError.value = '请输入用户名'; return false; }
    if (!loginPassword.value) { loginError.value = '请输入密码'; return false; }
    loginLoading.value = true;
    try {
      const res: ApiResponse<LoginData> = await loginApi(loginUsername.value, loginPassword.value);
      if (res.success) {
        token.value = res.data.token;
        user.value = res.data.user;
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        return true;
      } else {
        loginError.value = res.message || '登录失败';
        return false;
      }
    } catch (err: any) {
      loginError.value = err.response?.data?.message || '网络错误，请稍后重试';
      return false;
    } finally {
      loginLoading.value = false;
    }
  }

  // ─── 登录（直接调用，不管理表单状态）─────────
  async function login(username: string, password: string) {
    const res: ApiResponse<LoginData> = await loginApi(username, password);
    if (res.success) {
      token.value = res.data.token;
      user.value = res.data.user;
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  }

  // ─── 退出 ──────────────────────────────────
  /**
   * 退出登录：① 后端 token 失效 ② 清除本地状态
   * 即使接口失败也保证前端登出
   */
  async function logout() {
    try {
      await logoutApi();
    } catch { /* 网络异常不影响前端退出 */ }
    token.value = '';
    user.value = null;
    localStorage.clear();
  }

  return { token, user, isLoggedIn, isAdmin, userName,
    loginUsername, loginPassword, loginError, loginLoading, submitLogin,
    login, logout };
});
