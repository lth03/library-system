<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal modal-sm">
      <div class="modal-header">
        <h3>{{ user ? '✏️ 编辑用户' : '➕ 新增用户' }}</h3>
        <button class="modal-close" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>用户名 <span class="req">*</span></label>
          <input v-model="form.username" class="form-input" placeholder="3-50个字符" :disabled="!!user" />
        </div>
        <div class="form-group">
          <label>姓名 <span class="req">*</span></label>
          <input v-model="form.name" class="form-input" placeholder="真实姓名" />
        </div>
        <div class="form-group" v-if="!user">
          <label>密码 <span class="req">*</span></label>
          <input v-model="form.password" class="form-input" type="password" placeholder="至少6个字符" />
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input v-model="form.email" class="form-input" placeholder="email@example.com" />
        </div>
        <div class="form-group">
          <label>手机号</label>
          <input v-model="form.phone" class="form-input" placeholder="手机号" />
        </div>
        <div class="form-group">
          <label>角色</label>
          <select v-model="form.role" class="form-input">
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <div v-if="error" class="form-error">{{ error }}</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" @click="$emit('close')">取消</button>
        <button class="btn btn-primary" :disabled="submitting" @click="submit">{{ submitting ? '提交中…' : '保存' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { UserInfo } from '@/config/Interface';

const props = defineProps<{ visible: boolean; user: UserInfo | null; submitting: boolean; error: string }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'submit', data: any): void }>();

const form = reactive({ username: '', name: '', password: '', email: '', phone: '', role: 'user' as 'user' | 'admin' });

watch(() => props.visible, (v) => {
  if (v) {
    const u = props.user;
    form.username = u?.username || '';
    form.name = u?.name || '';
    form.password = '';
    form.email = u?.email || '';
    form.phone = u?.phone || '';
    form.role = u?.role || 'user';
  }
});

function submit() {
  if (!form.username.trim() || !form.name.trim()) return;
  if (!props.user && !form.password.trim()) return;
  emit('submit', { ...form });
}
</script>

<style lang="less" scoped src="./index.less"></style>
