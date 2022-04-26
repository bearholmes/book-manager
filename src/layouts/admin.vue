<template>
  <div class="h-full">
    <Header />
    <slot />
  </div>
</template>

<script setup>
import Header from '../components/layouts/HeaderAdmin';
import { useHead } from 'nuxt/app';
useHead({
  bodyAttrs: {
    class: 'h-full bg-gray-100',
  },
});
</script>
