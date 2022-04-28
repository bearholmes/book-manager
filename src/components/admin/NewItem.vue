<template>
  <li class="book-item-new__block">
    <button type="button" class="book-item-new__btn" @click="create">
      <DocumentAddIcon class="w-7 h-7 text-gray-400 mx-auto" />
      <span class="mt-2 block text-sm font-medium text-gray-600"> 새로운 도서 등록 </span>
    </button>
  </li>
</template>
<script setup>
import { DocumentAddIcon } from '@heroicons/vue/outline';
const emits = defineEmits(['create']);

const create = () => {
  emits('create');
};
</script>
<style scoped>
.book-item-new__block {
  @apply col-span-1 flex flex-col text-center rounded-lg shadow-sm overflow-hidden;
  min-height: 300px;
}
.book-item-new__btn {
  @apply relative block w-full h-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400;
}
</style>
