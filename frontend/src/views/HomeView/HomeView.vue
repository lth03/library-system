<template>
  <div class="home-page">
    <header class="topbar">
      <div class="topbar-left">
        <span class="logo">📚</span>
        <span class="title">图书馆管理系统</span>
      </div>
      <div class="topbar-right">
        <button class="theme-btn" @click="toggle">
          {{ isDark ? '🌙' : '☀️' }}
        </button>
        <span class="user-info">{{ auth.userName }}</span>
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </div>
    </header>

    <div class="body">
      <aside class="sidebar" :class="{ collapsed: layout.sidebarCollapsed }">
        <nav class="menu">
          <button
            v-for="item in layout.menuItems"
            :key="item.label"
            class="menu-item"
            @click="router.push(item.route)"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <span v-show="!layout.sidebarCollapsed" class="menu-label">{{ item.label }}</span>
          </button>
        </nav>

        <div class="sidebar-bottom">
          <button class="menu-item logout-item" @click="handleLogout">
            <span class="menu-icon">🚪</span>
            <span v-show="!layout.sidebarCollapsed" class="menu-label">退出登录</span>
          </button>
          <button class="collapse-btn" @click="layout.toggleSidebar()">
            {{ layout.sidebarCollapsed ? '▶' : '◀' }}
          </button>
        </div>
      </aside>

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 主页布局
 *
 * 顶栏（主题切换 + 用户信息 + 退出）
 * 侧栏（按角色动态渲染菜单 + 折叠）
 * 内容区（<router-view /> 渲染子页面）
 * 菜单与侧栏状态由 useLayoutStore 管理
 */
import { useAuthStore } from '@/stores/auth';
import { useLayoutStore } from '@/stores/layout';
import { useTheme } from '@/stores/theme';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const layout = useLayoutStore();
const { isDark, toggle } = useTheme();
const router = useRouter();

/** 退出登录 */
async function handleLogout() {
  await auth.logout();
  router.push('/login');
}
</script>

<style lang="less" scoped src="./HomeView.less"></style>
