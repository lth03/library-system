<template>
  <div class="books-page">
    <!-- ─── 页头 ────────────────────────────── -->
    <div class="page-header">
      <div>
        <h2>📚 图书管理</h2>
        <p class="desc">管理图书馆的全部藏书信息</p>
      </div>
      <div class="header-actions">
        <button v-if="isAdmin" class="btn btn-outline" @click="openCategoryMgr">🗂️ 分类管理</button>
        <button v-if="isAdmin" class="btn btn-primary" @click="openAddBook">➕ 新增图书</button>
      </div>
    </div>

    <!-- ─── 搜索/筛选栏 ──────────────────────── -->
    <div class="search-bar">
      <div class="search-input-wrap">
        <span class="search-icon">🔍</span>
        <input
          v-model="store.searchKeyword"
          class="search-input"
          placeholder="搜索书名、作者、ISBN…"
          @keyup.enter="store.search()"
        />
      </div>
      <select v-model="store.searchCategoryId" class="search-select" @change="store.search()">
        <option value="">全部分类</option>
        <option v-for="c in store.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <button class="btn btn-primary" @click="store.search()">搜索</button>
      <button v-if="store.searchKeyword || store.searchCategoryId" class="btn btn-ghost" @click="store.resetSearch()">重置</button>
    </div>

    <!-- ─── 图书表格 ────────────────────────── -->
    <BookTable
      :books="store.books"
      :loading="store.loading"
      :total="store.total"
      :current="store.currentPage"
      :page-size="store.pageSize" :is-admin="isAdmin"
      @view="viewBook"
      @edit="openEditBook"
      @toggle-status="(b: any) => store.toggleStatus(b)"
      @page-change="(p: number) => store.goPage(p)"
    />

    <!-- ─── 分类管理弹窗 ────────────────────── -->
    <CategoryManager
      :visible="showCategoryMgr"
      :list="store.categories"
      @close="closeCategoryMgr"
      @add="(n: string, s: number) => store.addCategory(n, s)"
      @update-sort="(c: any) => store.updateCategorySort(c)"
      @update-name="(c: any) => store.updateCategoryName(c)"
      @update-desc="(c: any) => store.updateCategoryDesc(c)"
      @delete="(c: any) => store.deleteCategory(c)"
    />

    <!-- ─── 新增/编辑图书弹窗 ──────────────── -->
    <BookFormModal
      :visible="showBookForm"
      :book="editingBook"
      :categories="store.categories"
      :submitting="store.submitting"
      :error="store.formError"
      @close="closeBookForm"
      @submit="handleBookSubmit"
    />

    <!-- ─── 图书详情弹窗 ────────────────────── -->
    <BookDetailModal
      :visible="showDetail"
      :book="detailBook"
      @close="showDetail = false"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 图书管理页面
 *
 * 搜索/筛选栏 + 图书表格 + 分类管理弹窗 + 新增/编辑弹窗 + 详情弹窗
 * 管理操作（增/删/改/分类管理）仅管理员可见
 */
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useBooksStore } from '@/stores/books';
import type { BookInfo } from '@/config/Interface';
import BookTable from './components/BookTable/index.vue';
import BookFormModal from './components/BookFormModal/index.vue';
import CategoryManager from './components/CategoryManager/index.vue';
import BookDetailModal from './components/BookDetailModal/index.vue';

const isAdmin = useAuthStore().isAdmin;
const store = useBooksStore();

// ─── 弹窗状态（UI 层，不放入 store）───────────
const showCategoryMgr = ref(false);
const showBookForm = ref(false);
const showDetail = ref(false);
const editingBook = ref<BookInfo | null>(null);
const detailBook = ref<BookInfo | null>(null);

onMounted(() => store.init());

// ─── 分类管理 ──────────────────────────────────
function openCategoryMgr() { store.loadCategories(); showCategoryMgr.value = true; }
function closeCategoryMgr() { showCategoryMgr.value = false; }

// ─── 图书表单 ──────────────────────────────────
function openAddBook() { editingBook.value = null; store.formError = ''; showBookForm.value = true; }
function openEditBook(book: BookInfo) { editingBook.value = book; store.formError = ''; showBookForm.value = true; }
function closeBookForm() { showBookForm.value = false; editingBook.value = null; store.formError = ''; }

async function handleBookSubmit(data: any) {
  const res = await store.submitBook(editingBook.value, data);
  if (res?.success) closeBookForm();
}

// ─── 查看详情 ──────────────────────────────────
function viewBook(book: BookInfo) { detailBook.value = book; showDetail.value = true; }
</script>

<style lang="less" scoped src="./books.less"></style>
