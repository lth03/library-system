<template>
  <div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>借阅人</th>
            <th>图书</th>
            <th>借阅日期</th>
            <th>应还日期</th>
            <th>状态</th>
            <th>续借次数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="7" class="table-empty">加载中…</td></tr>
          <tr v-else-if="records.length === 0"><td colspan="7" class="table-empty">暂无借阅记录</td></tr>
          <tr v-for="r in records" :key="r.id">
            <td>{{ r.userName }}</td>
            <td class="cell-title">{{ r.bookTitle }}</td>
            <td>{{ r.borrow_date }}</td>
            <td>{{ r.due_date }}</td>
            <td><span class="tag" :class="statusClass(r.status)">{{ statusLabel(r.status) }}</span></td>
            <td>{{ r.renew_count }}</td>
            <td>
              <div class="action-btns">
                <button class="btn-sm" title="查看详情" @click="$emit('view', r)">📄</button>
                <button v-if="r.status !== 'returned'" class="btn-sm btn-sm-ok" title="还书" @click="$emit('return', r)">📥</button>
                <button v-if="r.status !== 'returned'" class="btn-sm btn-sm-warn" title="续借" @click="$emit('renew', r)">🔄</button>
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
import type { BorrowRecord } from '@/config/Interface';

const props = defineProps<{
  records: BorrowRecord[]; loading: boolean; total: number; current: number; pageSize: number;
}>();
const emit = defineEmits<{
  (e: 'view', r: BorrowRecord): void;
  (e: 'return', r: BorrowRecord): void;
  (e: 'renew', r: BorrowRecord): void;
  (e: 'page-change', p: number): void;
}>();

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));
const visiblePages = computed(() => {
  const pages: number[] = []; const tp = totalPages.value; const cp = props.current;
  let s = Math.max(1, cp - 2), e = Math.min(tp, cp + 2);
  if (e - s < 4) { if (s === 1) e = Math.min(tp, s + 4); else s = Math.max(1, e - 4); }
  for (let i = s; i <= e; i++) pages.push(i);
  return pages;
});

function go(p: number) { if (p >= 1 && p <= totalPages.value) emit('page-change', p); }

function statusClass(s: string) {
  return s === 'borrowed' ? 'tag-blue' : s === 'returned' ? 'tag-green' : 'tag-red';
}
function statusLabel(s: string) {
  return s === 'borrowed' ? '借阅中' : s === 'returned' ? '已归还' : '逾期';
}
</script>

<style lang="less" scoped src="./style.less"></style>
