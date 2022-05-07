<template>
  <div className="h-full">
    <HeaderDefault />
    <slot />
    <Footer />
    <ToastList />
  </div>
</template>

<script setup>
import { useHead } from 'nuxt/app';
import ToastList from '~/components/popup/ToastList';
import HeaderDefault from '~/components/layouts/HeaderDefault';
import Footer from '~/components/layouts/Footer';

useHead({
  bodyAttrs: {
    class: 'h-full bg-gray-100',
  },
});
</script>
