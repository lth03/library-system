<template>
  <div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>用户名</th><th>邮箱</th><th>角色</th><th>状态</th><th>注册时间</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="6" class="table-empty">加载中…</td></tr>
          <tr v-else-if="users.length === 0"><td colspan="6" class="table-empty">暂无用户数据</td></tr>
          <tr v-for="u in users" :key="u.id">
            <td class="cell-name">{{ u.name }}<span class="cell-username">@{{ u.username }}</span></td>
            <td>{{ u.email || '—' }}</td>
            <td><span class="tag" :class="u.role === 'admin' ? 'tag-accent' : 'tag-blue'">{{ u.role === 'admin' ? '管理员' : '用户' }}</span></td>
            <td><span class="tag" :class="u.status === 1 ? 'tag-green' : 'tag-red'">{{ u.status === 1 ? '启用' : '禁用' }}</span></td>
            <td class="cell-date">{{ u.created_at?.slice(0, 10) }}</td>
            <td>
              <div class="action-btns">
                <button class="btn-sm" title="详情" @click="$emit('view', u)">📄</button>
                <button class="btn-sm" title="编辑" @click="$emit('edit', u)">✏️</button>
                <button class="btn-sm btn-sm-warn" title="重置密码" @click="$emit('reset-pwd', u)">🔑</button>
                <button class="btn-sm" :class="u.status === 1 ? 'btn-sm-warn' : 'btn-sm-ok'" @click="$emit('toggle-status', u)">{{ u.status === 1 ? '⬇️禁用' : '⬆️启用' }}</button>
                <button class="btn-sm btn-sm-danger" title="删除" @click="$emit('delete', u)">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="total > 0" class="pagination">
      <span class="page-info">共 {{ total }} 条，第 {{ current }} / {{ totalPages }} 页</span>
      <div class="page-btns">
        <button :disabled="current <= 1" @click="go(current - 1)">‹</button>
        <button v-for="p in visiblePages" :key="p" :class="{ active: p === current }" @click="go(p)">{{ p }}</button>
        <button :disabled="current >= totalPages" @click="go(current + 1)">›</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { UserInfo } from '@/config/Interface';

const props = defineProps<{ users: UserInfo[]; loading: boolean; total: number; current: number; pageSize: number }>();
const emit = defineEmits<{ (e: 'view', u: UserInfo): void; (e: 'edit', u: UserInfo): void; (e: 'reset-pwd', u: UserInfo): void; (e: 'toggle-status', u: UserInfo): void; (e: 'delete', u: UserInfo): void; (e: 'page-change', p: number): void }>();

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));
const visiblePages = computed(() => {
  const pages: number[] = []; const tp = totalPages.value; const cp = props.current;
  let s = Math.max(1, cp - 2), e = Math.min(tp, cp + 2);
  if (e - s < 4) { if (s === 1) e = Math.min(tp, s + 4); else s = Math.max(1, e - 4); }
  for (let i = s; i <= e; i++) pages.push(i);
  return pages;
});
function go(p: number) { if (p >= 1 && p <= totalPages.value) emit('page-change', p); }
</script>

<style lang="less" scoped src="./index.less"></style>
