<template>
  <div class="dashboard">
    <h2>📊 仪表盘</h2>
    <p class="desc">欢迎回来，{{ auth.userName }}！以下是系统概览。</p>

    <div v-if="store.loading" class="loading">加载中…</div>
    <div v-else-if="store.error" class="error">{{ store.error }}</div>
    <template v-else-if="store.data">
      <StatsGrid :stats="store.data.stats" />
      <div class="charts-row">
        <TrendChart :trend="store.data.trend" />
        <HotBookChart :hot-books="store.data.hotBooks" />
      </div>
      <OverdueTable :list="store.data.overdueList" />
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * 仪表盘页面
 *
 * 统计卡片 + ECharts 趋势图/热门图书 + 逾期列表
 * TrendChart / HotBookChart 异步加载以减少首屏体积
 */
import { defineAsyncComponent, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useDashboardStore } from '@/stores/dashboard';
import StatsGrid from './components/StatsGrid/index.vue';
import OverdueTable from './components/OverdueTable/index.vue';

const TrendChart = defineAsyncComponent(() => import('./components/TrendChart/index.vue'));
const HotBookChart = defineAsyncComponent(() => import('./components/HotBookChart/index.vue'));

const auth = useAuthStore();
const store = useDashboardStore();
onMounted(() => store.load());
</script>

<style lang="less" scoped src="./dashboard.less"></style>
