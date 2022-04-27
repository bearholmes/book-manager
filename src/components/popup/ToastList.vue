<template>
  <div aria-live="assertive" class="fixed mt-14 inset-0 flex-row items-end px-4 py-6 space-y-3 pointer-events-none sm:p-6 sm:items-start" v-if="list.length > 0">
    <toast v-for="item in list" :item="item" :key="item.key" />
  </div>
</template>

<script setup>
import Toast from './ToastItem';
import {computed} from "vue";
import { useStore } from '~/store/toast'
const store = useStore()

const list = computed(()=>store['GET_TOAST'])
</script>
