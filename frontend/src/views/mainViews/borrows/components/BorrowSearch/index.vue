<template>
  <div class="search-bar">
    <div class="search-input-wrap">
      <span class="search-icon">🔍</span>
      <input v-model="store.searchKeyword" class="search-input" placeholder="搜索借阅人、书名…" @keyup.enter="store.search()" />
    </div>
    <select v-model="store.searchStatus" class="search-select" @change="store.search()">
      <option value="">全部状态</option>
      <option value="borrowed">借阅中</option>
      <option value="returned">已归还</option>
      <option value="overdue">逾期</option>
    </select>
    <button class="btn btn-primary" @click="store.search()">搜索</button>
    <button v-if="store.searchKeyword || store.searchStatus" class="btn btn-ghost" @click="store.resetSearch()">重置</button>
  </div>
</template>

<script setup lang="ts">
import { useBorrowsStore } from '@/stores/borrows';
const store = useBorrowsStore();
</script>

<style lang="less" scoped src="./style.less"></style>
