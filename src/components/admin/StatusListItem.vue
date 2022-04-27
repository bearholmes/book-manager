<template>
  <div class="comm-status-item__block">
    <dt><slot name="dt" /></dt>
    <dd><slot name="dd" /></dd>
  </div>
</template>
<style scoped>
.comm-status-item__block {
  @apply px-4 py-3 bg-white shadow rounded-lg overflow-hidden sm:p-4;
}
.comm-status-item__block dt {
  @apply text-sm font-medium text-gray-500 truncate;
}
.comm-status-item__block dd {
  @apply mt-1 text-2xl text-gray-900;
}
</style>
