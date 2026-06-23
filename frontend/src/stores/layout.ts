/**
 * 布局状态管理
 *
 * 职责：
 *  - 侧栏折叠状态
 *  - 按角色动态生成导航菜单
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth';

export const useLayoutStore = defineStore('layout', () => {
  // ─── 侧栏 ──────────────────────────────────
  /** 侧栏是否折叠 */
  const sidebarCollapsed = ref(false);

  /** 切换侧栏折叠 */
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  // ─── 菜单 ──────────────────────────────────
  interface MenuItem { icon: string; label: string; route: string }

  const adminMenu: MenuItem[] = [
    { icon: '📊', label: '仪表盘', route: '/' },
    { icon: '📚', label: '图书管理', route: '/books' },
    { icon: '📋', label: '借阅管理', route: '/borrows' },
    { icon: '👥', label: '用户管理', route: '/users' },
    { icon: '👤', label: '个人中心', route: '/profile' },
  ];

  const userMenu: MenuItem[] = [
    { icon: '📊', label: '我的仪表盘', route: '/' },
    { icon: '📚', label: '图书列表', route: '/books' },
    { icon: '📋', label: '我的借阅', route: '/my-borrows' },
    { icon: '👤', label: '个人中心', route: '/profile' },
  ];

  /** 根据角色动态计算菜单 */
  const menuItems = computed<MenuItem[]>(() =>
    useAuthStore().isAdmin ? adminMenu : userMenu
  );

  return { sidebarCollapsed, toggleSidebar, menuItems };
});
