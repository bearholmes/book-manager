<template>
  <div v-if="list.length > 0" aria-live="assertive" class="toast-list__block">
    <toast v-for="item in list" :key="item.key" :item="item" />
  </div>
</template>

<script setup>
import Toast from './ToastItem';
import { computed } from 'vue';
import { useStore } from '~/store/toast';
const store = useStore();

const list = computed(() => store['GET_TOAST']);
</script>
<style scoped>
.toast-list__block {
  @apply fixed mt-14 inset-0 flex content-end flex-col-reverse p-4 pointer-events-none sm:p-6;
}
</style>
