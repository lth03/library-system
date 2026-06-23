import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getDashboardData } from '@/api/dashboard';
import type { DashboardData } from '@/config/Interface';

export const useDashboardStore = defineStore('dashboard', () => {
  // ─── 状态 ────────────────────────────────────
  /** 仪表盘完整数据 */
  const data = ref<DashboardData | null>(null);
  /** 是否首次加载中（默认 true） */
  const loading = ref(true);
  /** 错误信息 */
  const error = ref('');

  // ─── 加载数据 ──────────────────────────────
  /** 获取仪表盘统计、趋势、热门图书、逾期列表 */
  async function load() {
    loading.value = true;
    error.value = '';
    try {
      const res = await getDashboardData();
      if (res.success) {
        data.value = res.data!;
      } else {
        error.value = res.message || '获取数据失败';
      }
    } catch (e: any) {
      error.value = e?.response?.data?.message || '请求失败，请检查网络连接';
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, load };
});
