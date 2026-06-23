<template>
  <div v-if="visible && user" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal modal-sm">
      <div class="modal-header">
        <h3>📄 用户详情</h3>
        <button class="modal-close" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <div class="grid">
          <div class="item"><label>用户名</label><span>{{ user.username }}</span></div>
          <div class="item"><label>姓名</label><span>{{ user.name }}</span></div>
          <div class="item"><label>邮箱</label><span>{{ user.email || '—' }}</span></div>
          <div class="item"><label>手机号</label><span>{{ user.phone || '—' }}</span></div>
          <div class="item"><label>角色</label><span>{{ user.role === 'admin' ? '管理员' : '普通用户' }}</span></div>
          <div class="item"><label>状态</label><span>{{ user.status === 1 ? '启用' : '禁用' }}</span></div>
          <div class="item"><label>注册时间</label><span>{{ user.created_at?.slice(0, 10) }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserInfo } from '@/config/Interface';
defineProps<{ visible: boolean; user: UserInfo | null }>();
defineEmits<{ (e: 'close'): void }>();
</script>

<style lang="less" scoped src="./index.less"></style>
