<template>
  <div v-if="visible && record" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal modal-sm">
      <div class="modal-header">
        <h3>📄 借阅详情</h3>
        <button class="modal-close" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <div class="grid">
          <div class="item"><label>借阅人</label><span>{{ record.userName }}</span></div>
          <div class="item"><label>图书</label><span>{{ record.bookTitle }}</span></div>
          <div class="item"><label>作者</label><span>{{ record.bookAuthor }}</span></div>
          <div class="item"><label>借阅日期</label><span>{{ record.borrow_date }}</span></div>
          <div class="item"><label>应还日期</label><span>{{ record.due_date }}</span></div>
          <div class="item"><label>归还日期</label><span>{{ record.return_date || '—' }}</span></div>
          <div class="item"><label>状态</label><span>{{ { borrowed: '借阅中', returned: '已归还', overdue: '逾期' }[record.status] }}</span></div>
          <div class="item"><label>续借次数</label><span>{{ record.renew_count }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BorrowRecord } from '@/config/Interface';

defineProps<{ visible: boolean; record: BorrowRecord | null }>();
defineEmits<{ (e: 'close'): void }>();
</script>

<style lang="less" scoped src="./style.less"></style>
