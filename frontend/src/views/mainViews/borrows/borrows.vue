<template>
  <div class="borrows-page">
    <div class="page-header">
      <div>
        <h2>📋 借阅管理</h2>
        <p class="desc">管理全部借阅记录</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="openBorrow">📥 借书</button>
      </div>
    </div>

    <BorrowSearch />

    <BorrowTable
      :records="store.records"
      :loading="store.loading"
      :total="store.total"
      :current="store.currentPage"
      :page-size="store.pageSize"
      @view="viewDetail"
      @return="openReturn"
      @renew="openRenew"
      @page-change="(p) => store.goPage(p)"
    />

    <BorrowActionModal
      :visible="showActionModal"
      :mode="actionMode"
      :record="actionRecord"
      :submitting="store.submitting"
      :error="store.actionError"
      @close="closeActionModal"
      @confirm="handleAction"
    />

    <BorrowDetailModal
      :visible="showDetail"
      :record="detailRecord"
      @close="showDetail = false"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 借阅管理页面（仅管理员）
 *
 * 搜索/筛选 + 借阅表格 + 借/还/续操作弹窗 + 详情弹窗
 * 操作提交委托给 useBorrowsStore.execAction()
 */
import { ref, onMounted } from 'vue';
import { useBorrowsStore } from '@/stores/borrows';
import type { BorrowRecord } from '@/config/Interface';
import BorrowSearch from './components/BorrowSearch/index.vue';
import BorrowTable from './components/BorrowTable/index.vue';
import BorrowActionModal from './components/BorrowActionModal/index.vue';
import BorrowDetailModal from './components/BorrowDetailModal/index.vue';

const store = useBorrowsStore();
onMounted(() => store.loadRecords());

// ─── 弹窗状态（UI 层）────────────────────
const showActionModal = ref(false);
const actionMode = ref<'borrow' | 'return' | 'renew'>('borrow');
const actionRecord = ref<BorrowRecord | null>(null);
const showDetail = ref(false);
const detailRecord = ref<BorrowRecord | null>(null);

function openBorrow() { actionMode.value = 'borrow'; actionRecord.value = null; store.actionError = ''; showActionModal.value = true; }
function openReturn(r: BorrowRecord) { actionMode.value = 'return'; actionRecord.value = r; store.actionError = ''; showActionModal.value = true; }
function openRenew(r: BorrowRecord) { actionMode.value = 'renew'; actionRecord.value = r; store.actionError = ''; showActionModal.value = true; }
function closeActionModal() { showActionModal.value = false; }

async function handleAction(data: any) {
  const res = await store.execAction(actionMode.value, actionRecord.value?.id ?? null, data);
  if (res?.success) closeActionModal();
}

function viewDetail(r: BorrowRecord) { detailRecord.value = r; showDetail.value = true; }
</script>

<style lang="less" scoped src="./borrows.less"></style>
