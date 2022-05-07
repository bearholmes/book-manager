<template>
  <footer>
    <Container class="text-center text-xs">
      <span class="text-gray-500">
        <a href="https://github.com/bearholmes" target="_blank" class="hover:text-blue-500">@bearholmes</a>
        | <span>icon by <a href="https://www.flaticon.com" target="_blank" class="hover:text-blue-500">flaticon</a></span> |
        <nuxt-link to="/open-license" class="hover:text-blue-500">오픈소스 라이센스</nuxt-link>
      </span>
    </Container>
  </footer>
</template>
<script setup>
import Container from '../common/Container';
</script>
