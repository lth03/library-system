<template>
  <div class="users-page">
    <div class="page-header">
      <div>
        <h2>👥 用户管理</h2>
        <p class="desc">管理全部用户账户</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="openAdd">➕ 新增用户</button>
      </div>
    </div>

    <div class="search-bar">
      <div class="search-input-wrap">
        <span class="search-icon">🔍</span>
        <input v-model="store.searchKeyword" class="search-input" placeholder="搜索用户名、邮箱…" @keyup.enter="store.search()" />
      </div>
      <button class="btn btn-primary" @click="store.search()">搜索</button>
      <button v-if="store.searchKeyword" class="btn btn-ghost" @click="resetSearch">重置</button>
    </div>

    <UserTable
      :users="store.users" :loading="store.loading" :total="store.total"
      :current="store.currentPage" :page-size="store.pageSize"
      @view="viewDetail" @edit="openEdit" @reset-pwd="(u) => store.resetUserPassword(u)"
      @toggle-status="(u) => store.toggleUserStatus(u)" @delete="(u) => store.confirmDeleteUser(u)"
      @page-change="(p) => store.goPage(p)"
    />

    <UserFormModal :visible="showForm" :user="editingUser" :submitting="store.submitting" :error="store.formError"
      @close="closeForm" @submit="handleSubmit" />

    <UserDetailModal :visible="showDetail" :user="detailUser" @close="showDetail = false" />
  </div>
</template>

<script setup lang="ts">
/**
 * 用户管理页面（仅管理员）
 *
 * 搜索栏 + 用户表格 + 新增/编辑弹窗 + 详情弹窗
 * CRUD 操作均委托给 useUsersStore
 */
import { ref, onMounted } from 'vue';
import { useUsersStore } from '@/stores/users';
import type { UserInfo } from '@/config/Interface';
import UserTable from './components/UserTable/index.vue';
import UserFormModal from './components/UserFormModal/index.vue';
import UserDetailModal from './components/UserDetailModal/index.vue';

const store = useUsersStore();
onMounted(() => store.loadUsers());

// ─── 弹窗状态（UI 层）────────────────────
const showForm = ref(false);
const showDetail = ref(false);
const editingUser = ref<UserInfo | null>(null);
const detailUser = ref<UserInfo | null>(null);

function resetSearch() { store.searchKeyword = ''; store.search(); }

function openAdd() { editingUser.value = null; store.formError = ''; showForm.value = true; }
function openEdit(u: UserInfo) { editingUser.value = u; store.formError = ''; showForm.value = true; }
function closeForm() { showForm.value = false; }

async function handleSubmit(data: any) {
  const res = await store.submitUser(editingUser.value, data);
  if (res?.success) closeForm();
}

function viewDetail(u: UserInfo) { detailUser.value = u; showDetail.value = true; }
</script>

<style lang="less" scoped src="./users.less"></style>
