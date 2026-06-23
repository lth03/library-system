<template>
  <div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>书名</th>
            <th>作者</th>
            <th>ISBN</th>
            <th>分类</th>
            <th>库存</th>
            <th>可借</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="table-empty">加载中…</td>
          </tr>
          <tr v-else-if="books.length === 0">
            <td colspan="8" class="table-empty">暂无图书数据</td>
          </tr>
          <tr v-for="book in books" :key="book.id">
            <td class="cell-title">{{ book.title }}</td>
            <td>{{ book.author }}</td>
            <td class="cell-isbn">{{ book.isbn }}</td>
            <td>{{ book.category_name || '未分类' }}</td>
            <td>{{ book.total_count }}</td>
            <td>{{ book.available_count }}</td>
            <td>
              <span class="tag" :class="book.status === 1 ? 'tag-green' : 'tag-red'">
                {{ book.status === 1 ? '上架' : '下架' }}
              </span>
            </td>
            <td>
              <div class="action-btns">
                <button class="btn-sm" title="查看详情" @click="$emit('view', book)">📄</button>
                <button v-if="isAdmin" class="btn-sm" title="编辑" @click="$emit('edit', book)">✏️</button>
                <button v-if="isAdmin"
                  class="btn-sm"
                  :class="book.status === 1 ? 'btn-sm-warn' : 'btn-sm-ok'"
                  @click="$emit('toggle-status', book)"
                >
                  {{ book.status === 1 ? '⬇️下架' : '⬆️上架' }}
                </button>
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
        <button
          v-for="p in visiblePages"
          :key="p"
          :class="{ active: p === current }"
          @click="go(p)"
        >{{ p }}</button>
        <button :disabled="current >= totalPages" @click="go(current + 1)">›</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BookInfo } from '@/config/Interface';

const props = defineProps<{
  books: BookInfo[];
  loading: boolean;
  total: number;
  current: number;
  pageSize: number;
  isAdmin: boolean;
}>();

const emit = defineEmits<{
  (e: 'view', book: BookInfo): void;
  (e: 'edit', book: BookInfo): void;
  (e: 'toggle-status', book: BookInfo): void;
  (e: 'page-change', page: number): void;
}>();

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));

const visiblePages = computed(() => {
  const pages: number[] = [];
  const tp = totalPages.value;
  const cp = props.current;
  let start = Math.max(1, cp - 2);
  let end = Math.min(tp, cp + 2);
  if (end - start < 4) {
    if (start === 1) end = Math.min(tp, start + 4);
    else start = Math.max(1, end - 4);
  }
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

// 这个函数用于处理分页按钮的点击事件。当用户点击某个页码按钮时，会触发 'page-change' 事件，并传递新的页码。
function go(p: number) {

  // 如果页码小于 1 或大于总页数，则不触发事件，避免无效的页码请求。
  if (p < 1 || p > totalPages.value) return;
  emit('page-change', p);
}
</script>

<style lang="less" scoped src="./style.less"></style>
