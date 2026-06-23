<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal modal-md">
      <div class="modal-header">
        <h3>🗂️ 分类管理</h3>
        <button class="modal-close" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <div class="add-row">
          <input v-model="newName" class="form-input" placeholder="分类名称" @keyup.enter="add" />
          <input v-model.number="newSort" class="form-input input-sort" type="number" placeholder="排序" />
          <button class="btn btn-primary btn-sm" :disabled="!newName.trim()" @click="add">新增</button>
        </div>
        <table class="data-table cat-table">
          <thead>
            <tr><th>排序</th><th>名称</th><th>描述</th><th>操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="cat in list" :key="cat.id">
              <td>
                <input v-model.number="cat.sort_order" class="form-input input-xs" type="number" @change="updateSort(cat)" />
              </td>
              <td>
                <input v-model="cat.editName" class="form-input" @blur="updateName(cat)" />
              </td>
              <td>
                <input v-model="cat.editDesc" class="form-input" @blur="updateDesc(cat)" placeholder="无描述" />
              </td>
              <td>
                <button class="btn-sm btn-sm-danger" @click="remove(cat)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Category } from '@/config/Interface';

const props = defineProps<{
  visible: boolean;
  list: (Category & { editName?: string; editDesc?: string })[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'add', name: string, sort: number): void;
  (e: 'update-sort', cat: Category): void;
  (e: 'update-name', cat: Category & { editName: string }): void;
  (e: 'update-desc', cat: Category & { editDesc: string }): void;
  (e: 'delete', cat: Category): void;
}>();

const newName = ref('');
const newSort = ref(0);

function add() {
  if (!newName.value.trim()) return;
  emit('add', newName.value.trim(), newSort.value);
  newName.value = '';
  newSort.value = 0;
}

function updateSort(cat: any) { emit('update-sort', cat); }
function updateName(cat: any) {
  if (cat.editName === cat.name) return;
  emit('update-name', cat);
}
function updateDesc(cat: any) {
  if (cat.editDesc === (cat.description || '')) return;
  emit('update-desc', cat);
}
function remove(cat: any) { emit('delete', cat); }
</script>

<style lang="less" scoped src="./style.less"></style>
