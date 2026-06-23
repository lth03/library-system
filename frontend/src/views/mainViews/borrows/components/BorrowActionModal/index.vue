<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal modal-sm">
      <div class="modal-header">
        <h3>{{ mode === 'borrow' ? '📥 借书' : mode === 'return' ? '📤 还书' : '🔄 续借' }}</h3>
        <button class="modal-close" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <template v-if="mode === 'borrow'">
          <div class="form-group">
            <label>借阅用户 <span class="req">*</span></label>
            <div class="search-select" ref="userRef">
              <input v-model="store.userQuery" class="form-input" placeholder="搜索用户名…" @input="store.searchUsers()" @focus="userOpen = true" />
              <ul v-if="userOpen && store.userResults.length" class="search-dropdown">
                <li v-for="u in store.userResults" :key="u.id" :class="{ active: store.selectedUserId === u.id }" @click="store.pickUser(u); userOpen = false">
                  {{ u.name }}
                </li>
              </ul>
              <span v-if="store.selectedUserName" class="selected-tag">已选: {{ store.selectedUserName }}</span>
            </div>
          </div>
          <div class="form-group">
            <label>图书 <span class="req">*</span></label>
            <div class="search-select" ref="bookRef">
              <input v-model="store.bookQuery" class="form-input" placeholder="搜索书名…" @input="store.searchBooks()" @focus="bookOpen = true" />
              <ul v-if="bookOpen && store.bookResults.length" class="search-dropdown">
                <li v-for="b in store.bookResults" :key="b.id" :class="{ active: store.selectedBookId === b.id, disabled: b.available_count <= 0 }" @click="store.pickBook(b); bookOpen = false">
                  {{ b.title }}
                </li>
              </ul>
              <span v-if="store.selectedBookTitle" class="selected-tag">已选: {{ store.selectedBookTitle }}</span>
            </div>
          </div>
          <div class="form-group">
            <label>应还日期 <span class="req">*</span></label>
            <input v-model="dueDate" class="form-input" type="date" />
          </div>
        </template>
        <template v-else-if="mode === 'return'">
          <p>确定归还 <strong>{{ record?.bookTitle }}</strong>（借阅人：{{ record?.userName }}）吗？</p>
        </template>
        <template v-else>
          <p>续借 <strong>{{ record?.bookTitle }}</strong>（借阅人：{{ record?.userName }}）</p>
          <div class="form-group">
            <label>新应还日期 <span class="req">*</span></label>
            <input v-model="dueDate" class="form-input" type="date" />
          </div>
        </template>
        <div v-if="error" class="form-error">{{ error }}</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" @click="$emit('close')">取消</button>
        <button class="btn btn-primary" :disabled="submitting" @click="confirm">
          {{ submitting ? '提交中…' : '确定' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useBorrowsStore } from '@/stores/borrows';
import type { BorrowRecord } from '@/config/Interface';

const props = defineProps<{ visible: boolean; mode: 'borrow' | 'return' | 'renew'; record: BorrowRecord | null; submitting: boolean; error: string }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'confirm', data: any): void }>();

const store = useBorrowsStore();
const userOpen = ref(false);
const bookOpen = ref(false);
const userRef = ref<HTMLElement | null>(null);
const bookRef = ref<HTMLElement | null>(null);
const dueDate = ref('');

function onDocClick(e: MouseEvent) {
  if (userRef.value && !userRef.value.contains(e.target as Node)) userOpen.value = false;
  if (bookRef.value && !bookRef.value.contains(e.target as Node)) bookOpen.value = false;
}
onMounted(() => document.addEventListener('click', onDocClick));
onUnmounted(() => document.removeEventListener('click', onDocClick));

watch(() => props.visible, (v) => {
  if (v) {
    dueDate.value = '';
    store.clearSearch();
    if (props.mode === 'renew' && props.record) {
      const d = new Date(props.record.due_date);
      d.setDate(d.getDate() + 14);
      dueDate.value = d.toISOString().slice(0, 10);
    }
  }
});

function confirm() {
  if (props.mode === 'borrow') {
    if (!store.selectedUserId || !store.selectedBookId || !dueDate.value) return;
    emit('confirm', { user_id: store.selectedUserId, book_id: store.selectedBookId, due_date: dueDate.value });
  } else if (props.mode === 'return') {
    emit('confirm', {});
  } else {
    if (!dueDate.value) return;
    emit('confirm', { due_date: dueDate.value });
  }
}
</script>

<style lang="less" scoped src="./style.less"></style>
