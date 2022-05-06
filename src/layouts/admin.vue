<template>
  <div class="h-full">
    <Header />
    <slot />
    <ToastList />
  </div>
</template>

<script setup>
import Header from '~/components/layouts/HeaderAdmin';
import { useHead } from 'nuxt/app';
import ToastList from '~/components/popup/ToastList';
useHead({
  bodyAttrs: {
    class: 'h-full bg-gray-100',
  },
});
</script>
