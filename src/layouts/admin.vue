<template>
  <div class="h-full">
    <Header />
    <slot />
    <Footer />
    <ToastList />
  </div>
</template>

<script setup>
import { useHead } from 'nuxt/app';
import Header from '~/components/layouts/HeaderAdmin';
import ToastList from '~/components/popup/ToastList';
import Footer from '~/components/layouts/Footer';

useHead({
  bodyAttrs: {
    class: 'h-full bg-gray-100',
  },
});
</script>
