<template>
  <dl class="comm-status-list__block">
    <slot />
  </dl>
</template>
<style scoped>
.comm-status-list__block {
  @apply grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5;
}
</style>
