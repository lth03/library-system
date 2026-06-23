import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getUserById, changeMyPassword } from '@/api/users';
import type { UserInfo } from '@/config/Interface';

export const useProfileStore = defineStore('profile', () => {
  // ─── 状态 ────────────────────────────────────
  /** 当前用户资料 */
  const profile = ref<UserInfo | null>(null);
  /** 加载中 */
  const loading = ref(false);

  // ─── 资料 ──────────────────────────────────
  /** 根据用户 ID 加载个人资料 */
  async function loadProfile(userId: number) {
    loading.value = true;
    try {
      const res = await getUserById(userId);
      if (res.success) profile.value = res.data!;
    } catch { /* ignore */ } finally { loading.value = false; }
  }

  // ─── 密码 ──────────────────────────────────
  const oldPwd = ref('');
  const newPwd = ref('');
  const confirmPwd = ref('');
  const pwdError = ref('');
  const pwdSuccess = ref('');
  const pwdSubmitting = ref(false);

  /** 修改密码（含表单校验） */
  async function changePwd() {
    pwdError.value = ''; pwdSuccess.value = '';
    if (!oldPwd.value) { pwdError.value = '请输入当前密码'; return null; }
    if (!newPwd.value || newPwd.value.length < 6) { pwdError.value = '新密码至少6位'; return null; }
    if (newPwd.value !== confirmPwd.value) { pwdError.value = '两次密码不一致'; return null; }
    pwdSubmitting.value = true;
    try {
      const res = await changeMyPassword(oldPwd.value, newPwd.value);
      if (res.success) {
        pwdSuccess.value = '✅ 密码修改成功';
        oldPwd.value = ''; newPwd.value = ''; confirmPwd.value = '';
      } else {
        pwdError.value = res.message;
      }
      return res;
    } catch (e: any) {
      pwdError.value = e?.response?.data?.message || '修改失败';
      return null;
    } finally { pwdSubmitting.value = false; }
  }

  return { profile, loading, loadProfile, changeMyPassword,
    oldPwd, newPwd, confirmPwd, pwdError, pwdSuccess, pwdSubmitting, changePwd };
});
