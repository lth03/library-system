<template>
  <div class="page">
    <h2>📋 我的借阅</h2>
    <p class="desc">查看自己的借阅记录</p>

    <BorrowTable
      :records="store.records" :loading="store.loading" :total="store.total"
      :current="store.currentPage" :page-size="store.pageSize" :is-admin="isAdmin"
      @view="viewDetail" @return="(r) => store.confirmReturn(r)" @renew="(r) => store.confirmRenew(r)"
      @page-change="(p) => store.goPage(p)"
    />

    <BorrowDetailModal :visible="showDetail" :record="detailRecord" @close="showDetail = false" />
  </div>
</template>

<script setup lang="ts">
/**
 * 我的借阅页面
 *
 * 当前用户的借阅记录列表
 * 管理员可以看到还书/续借按钮
 */
import { ref, onMounted } from 'vue';
import { useMyBorrowsStore } from '@/stores/myBorrows';
import type { BorrowRecord } from '@/config/Interface';
import BorrowTable from './components/BorrowTable/index.vue';
import BorrowDetailModal from './components/BorrowDetailModal/index.vue';

import { useAuthStore } from '@/stores/auth';

const store = useMyBorrowsStore();
const isAdmin = useAuthStore().isAdmin;
onMounted(() => store.loadRecords());

// ─── 弹窗状态（UI 层）────────────────────
const showDetail = ref(false);
const detailRecord = ref<BorrowRecord | null>(null);

function viewDetail(r: BorrowRecord) { detailRecord.value = r; showDetail.value = true; }
</script>

<style lang="less" scoped>
.page { padding: 24px; width: 100%; max-width: 1400px; margin: 0 auto; }
h2 { margin: 0 0 4px; color: var(--text-h); font-size: 22px; }
.desc { margin: 0 0 20px; color: var(--text); font-size: 14px; }
</style>
