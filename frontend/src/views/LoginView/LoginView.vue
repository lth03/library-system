<template>
  <div class="login-page">
    <button class="theme-btn" @click="toggle">{{ isDark ? '🌙' : '☀️' }}</button>
    <div class="login-card">
      <div class="login-header">
        <div class="logo">📚</div>
        <h1>图书馆管理系统</h1>
        <p class="subtitle">请登录以继续</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="auth.loginUsername"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="auth.loginPassword"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
            required
          />
        </div>

        <p v-if="auth.loginError" class="error-msg">{{ auth.loginError }}</p>

        <button type="submit" class="login-btn" :disabled="auth.loginLoading">
          {{ auth.loginLoading ? '登录中...' : '登 录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 登录页
 *
 * 用户名 + 密码表单，调用 auth.submitLogin() 认证
 * 登录成功跳转仪表盘
 * 表单状态与提交逻辑在 useAuthStore 中管理
 */
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/stores/theme';

const router = useRouter();
const auth = useAuthStore();
const { isDark, toggle } = useTheme();

/** 提交登录 */
async function handleLogin() {
  const ok = await auth.submitLogin();
  if (ok) router.push('/');
}
</script>

<style lang="less" scoped src="./LoginView.less"></style>
