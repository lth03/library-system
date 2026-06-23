/**
 * 路由配置
 *
 * 路由结构：
 *   /login        — 登录页（公开）
 *   /             — 主页布局（需登录）
 *     /dashboard  — 仪表盘
 *     /books      — 图书管理
 *     /borrows    — 借阅管理（admin）
 *     /my-borrows — 我的借阅
 *     /users      — 用户管理（admin）
 *     /profile    — 个人中心
 *
 * 路由守卫：
 *   1. 未登录 → 重定向到 /login
 *   2. 非管理员访问 admin 路由 → 重定向到 /dashboard
 */
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import HomeView from '@/views/HomeView/HomeView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      meta: { title: '登录' },
      component: () => import('@/views/LoginView/LoginView.vue'),
    },
    {
      path: '/',
      component: HomeView,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          meta: { title: '仪表盘' },
          component: () => import('@/views/mainViews/dashboard/dashboard.vue'),
        },
        {
          path: 'books',
          name: 'Books',
          meta: { title: '图书管理' },
          component: () => import('@/views/mainViews/books/books.vue'),
        },
        {
          path: 'borrows',
          name: 'Borrows',
          meta: { title: '借阅管理', requiresAdmin: true },
          component: () => import('@/views/mainViews/borrows/borrows.vue'),
        },
        {
          path: 'my-borrows',
          name: 'MyBorrows',
          meta: { title: '我的借阅' },
          component: () => import('@/views/mainViews/myBorrows/myBorrows.vue'),
        },
        {
          path: 'users',
          name: 'Users',
          meta: { title: '用户管理', requiresAdmin: true },
          component: () => import('@/views/mainViews/users/users.vue'),
        },
        {
          path: 'profile',
          name: 'Profile',
          meta: { title: '个人中心' },
          component: () => import('@/views/mainViews/profile/profile.vue'),
        },
      ],
    },
  ],
});

// ─── 路由守卫 ──────────────────────────────
router.beforeEach((to, _from) => {
  const auth = useAuthStore();

  // 未登录 → 跳转登录页
  if (to.name !== 'Login' && !auth.isLoggedIn) {
    return { name: 'Login' };
  }

  // 已登录但非管理员访问管理员路由 → 跳转仪表盘
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'Dashboard' };
  }
});

export default router;
