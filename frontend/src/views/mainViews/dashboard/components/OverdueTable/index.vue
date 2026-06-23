<template>
  <div class="overdue-section">
    <h3>🚨 逾期借阅提醒</h3>
    <div v-if="list.length === 0" class="overdue-empty">🎉 当前无逾期记录</div>
    <table v-else class="overdue-table">
      <thead>
        <tr><th>借阅人</th><th>图书</th><th>借书日期</th><th>应还日期</th><th>逾期天数</th></tr>
      </thead>
      <tbody>
        <tr v-for="item in list" :key="item.id" class="overdue-row">
          <td>{{ item.userName }}</td>
          <td>{{ item.bookTitle }}</td>
          <td>{{ item.borrowDate }}</td>
          <td>{{ item.dueDate }}</td>
          <td class="overdue-days">{{ item.daysOverdue }} 天</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { OverdueRecord } from '@/config/Interface';

defineProps<{ list: OverdueRecord[] }>();
</script>

<style lang="less" scoped src="./style.less"></style>
