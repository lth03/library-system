<template>
  <div class="stats-grid">
    <div class="stat-card">
      <span class="stat-icon">📚</span>
      <div class="stat-info">
        <span class="stat-value">{{ stats.totalBooks }}</span>
        <span class="stat-label">总藏书量</span>
      </div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">✅</span>
      <div class="stat-info">
        <span class="stat-value">{{ stats.availableBooks }}</span>
        <span class="stat-label">可借数量</span>
      </div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">👥</span>
      <div class="stat-info">
        <span class="stat-value">{{ stats.totalUsers }}</span>
        <span class="stat-label">总用户数</span>
      </div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">📤</span>
      <div class="stat-info">
        <span class="stat-value">{{ stats.todayBorrows }}</span>
        <span class="stat-label">今日借出</span>
      </div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">📥</span>
      <div class="stat-info">
        <span class="stat-value">{{ stats.todayReturns }}</span>
        <span class="stat-label">今日归还</span>
      </div>
    </div>
    <div class="stat-card stat-card--warn" v-if="isAdmin">
      <span class="stat-icon">⚠️</span>
      <div class="stat-info">
        <span class="stat-value">{{ stats.overdueBooks }}</span>
        <span class="stat-label">逾期图书数</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { DashboardStats } from '@/config/Interface';

defineProps<{ stats: DashboardStats }>();
const isAdmin = computed(() => useAuthStore().isAdmin);
</script>

<style lang="less" scoped src="./style.less"></style>
