<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ isEdit ? '✏️ 编辑图书' : '➕ 新增图书' }}</h3>
        <button class="modal-close" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="form-group">
            <label>ISBN <span class="req">*</span></label>
            <input v-model="local.isbn" class="form-input" placeholder="978-X-XXX-XXXXX-X" :disabled="isEdit" />
          </div>
          <div class="form-group">
            <label>书名 <span class="req">*</span></label>
            <input v-model="local.title" class="form-input" placeholder="请输入书名" />
          </div>
          <div class="form-group">
            <label>作者 <span class="req">*</span></label>
            <input v-model="local.author" class="form-input" placeholder="请输入作者" />
          </div>
          <div class="form-group">
            <label>出版社</label>
            <input v-model="local.publisher" class="form-input" placeholder="请输入出版社" />
          </div>
          <div class="form-group">
            <label>出版年份</label>
            <input v-model.number="local.publish_year" class="form-input" type="number" placeholder="例如 2024" />
          </div>
          <div class="form-group">
            <label>分类</label>
            <select v-model="local.category_id" class="form-input">
              <option :value="null">无分类</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>馆藏总数 <span class="req">*</span></label>
            <input v-model.number="local.total_count" class="form-input" type="number" min="1" />
          </div>
          <div class="form-group">
            <label>可借数量 <span class="req">*</span></label>
            <input v-model.number="local.available_count" class="form-input" type="number" min="0" />
          </div>
        </div>
        <div class="form-group form-group-full">
          <label>简介</label>
          <textarea v-model="local.description" class="form-textarea" rows="3" placeholder="选填"></textarea>
        </div>
        <div v-if="error" class="form-error">{{ error }}</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" @click="$emit('close')">取消</button>
        <button class="btn btn-primary" :disabled="submitting" @click="handleSubmit">
          {{ submitting ? '提交中…' : '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { BookInfo, Category } from '@/config/Interface';

const props = defineProps<{
  visible: boolean;
  book: BookInfo | null;
  categories: Category[];
  submitting: boolean;
  error: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', data: {
    isbn: string; title: string; author: string; publisher?: string;
    publish_year?: number; category_id?: number; total_count: number;
    available_count: number; description?: string;
  }): void;
}>();

const isEdit = computed(() => !!props.book);

const local = reactive({
  isbn: '',
  title: '',
  author: '',
  publisher: '',
  publish_year: null as number | null,
  category_id: null as number | null,
  total_count: 1,
  available_count: 1,
  description: '',
});

watch(() => props.visible, (v) => {
  if (v) {
    const b = props.book;
    local.isbn = b?.isbn || '';
    local.title = b?.title || '';
    local.author = b?.author || '';
    local.publisher = b?.publisher || '';
    local.publish_year = b?.publish_year ?? null;
    local.category_id = b?.category_id ?? null;
    local.total_count = b?.total_count ?? 1;
    local.available_count = b?.available_count ?? 1;
    local.description = b?.description || '';
  }
});

function handleSubmit() {
  if (!local.isbn.trim()) { emit('submit', null as any); return; }
  if (!local.title.trim()) { emit('submit', null as any); return; }
  if (!local.author.trim()) { emit('submit', null as any); return; }
  if (!local.total_count || local.total_count < 1) { emit('submit', null as any); return; }
  if (local.available_count == null || local.available_count < 0) { emit('submit', null as any); return; }

  emit('submit', {
    isbn: local.isbn.trim(),
    title: local.title.trim(),
    author: local.author.trim(),
    publisher: local.publisher || undefined,
    publish_year: local.publish_year || undefined,
    category_id: local.category_id ?? undefined,
    total_count: local.total_count,
    available_count: local.available_count,
    description: local.description || undefined,
  });
}
</script>

<style lang="less" scoped src="./style.less"></style>
