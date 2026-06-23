<template>
  <div v-if="visible && book" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal modal-sm">
      <div class="modal-header">
        <h3>📄 图书详情</h3>
        <button class="modal-close" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <div class="grid">
          <div class="item"><label>书名</label><span>{{ book.title }}</span></div>
          <div class="item"><label>作者</label><span>{{ book.author }}</span></div>
          <div class="item"><label>ISBN</label><span class="mono">{{ book.isbn }}</span></div>
          <div class="item"><label>分类</label><span>{{ book.category_name || '未分类' }}</span></div>
          <div class="item"><label>出版社</label><span>{{ book.publisher || '—' }}</span></div>
          <div class="item"><label>出版年份</label><span>{{ book.publish_year || '—' }}</span></div>
          <div class="item"><label>馆藏总数</label><span>{{ book.total_count }}</span></div>
          <div class="item"><label>可借数量</label><span>{{ book.available_count }}</span></div>
          <div class="item"><label>状态</label><span>{{ book.status === 1 ? '上架' : '下架' }}</span></div>
          <div class="item full"><label>简介</label><span>{{ book.description || '无' }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BookInfo } from '@/config/Interface';

defineProps<{
  visible: boolean;
  book: BookInfo | null;
}>();

defineEmits<{
  (e: 'close'): void;
}>();
</script>

<style lang="less" scoped src="./style.less"></style>
