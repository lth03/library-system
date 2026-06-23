<template>
  <div class="profile-page">
    <h2>👤 个人中心</h2>

    <div v-if="store.loading" class="loading">加载中…</div>

    <template v-else>
      <!-- ─── 信息卡片 ──────────────────────────── -->
      <div class="card info-card">
        <h3>📋 基本信息</h3>
        <div class="info-grid">
          <div class="info-item"><label>用户名</label><span>{{ store.profile?.username }}</span></div>
          <div class="info-item"><label>姓名</label><span>{{ store.profile?.name }}</span></div>
          <div class="info-item"><label>邮箱</label><span>{{ store.profile?.email || '—' }}</span></div>
          <div class="info-item"><label>手机号</label><span>{{ store.profile?.phone || '—' }}</span></div>
          <div class="info-item"><label>角色</label><span class="tag" :class="store.profile?.role === 'admin' ? 'tag-accent' : 'tag-blue'">{{ store.profile?.role === 'admin' ? '管理员' : '普通用户' }}</span></div>
          <div class="info-item"><label>注册时间</label><span>{{ store.profile?.created_at?.slice(0, 10) }}</span></div>
        </div>
      </div>

      <!-- ─── 修改密码 ──────────────────────────── -->
      <div class="card pwd-card">
        <h3>🔑 修改密码</h3>
        <div class="pwd-form">
          <div class="form-group">
            <label>当前密码</label>
            <input v-model="store.oldPwd" class="form-input" type="password" placeholder="输入当前密码" />
          </div>
          <div class="form-group">
            <label>新密码</label>
            <input v-model="store.newPwd" class="form-input" type="password" placeholder="至少6位" />
          </div>
          <div class="form-group">
            <label>确认新密码</label>
            <input v-model="store.confirmPwd" class="form-input" type="password" placeholder="再次输入新密码" />
          </div>
          <div v-if="store.pwdError" class="form-error">{{ store.pwdError }}</div>
          <div v-if="store.pwdSuccess" class="form-success">{{ store.pwdSuccess }}</div>
          <button class="btn btn-primary" :disabled="store.pwdSubmitting" @click="store.changePwd()">
            {{ store.pwdSubmitting ? '提交中…' : '修改密码' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * 个人中心页面
 *
 * 信息卡片 + 修改密码表单
 * 密码表单状态与校验逻辑在 useProfileStore 中管理
 */
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useProfileStore } from '@/stores/profile';

const auth = useAuthStore();
const store = useProfileStore();

onMounted(() => { if (auth.user) store.loadProfile(auth.user.id); });
</script>

<style lang="less" scoped src="./profile.less"></style>

