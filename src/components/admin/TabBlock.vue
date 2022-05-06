<template>
  <Container>
    <div class="border-b border-gray-300 mb-1">
      <div class="sm:flex sm:items-baseline">
        <div class="ml-2">
          <nav class="flex space-x-4" style="margin-bottom: -1px">
            <button
              v-for="(tab, idx) in props.list"
              :key="idx"
              class="whitespace-nowrap pb-2 px-4 border-b-2 font-medium text-sm"
              :class="[current(tab) ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
              :aria-current="current(tab) ? 'page' : undefined"
              @click="onClickSelected(tab)"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>
    </div>
  </Container>
</template>
<script setup>
import { computed } from 'vue';
import Container from '~/components/common/Container';

const props = defineProps({
  selected: {
    type: String,
    default: '',
  },
  list: {
    type: Array,
    default: () => {
      return [];
    },
  },
});

const emits = defineEmits(['update:selected']);

const selected = computed({
  get() {
    return props.selected;
  },
  set(val) {
    emits('update:selected', val);
  },
});

const onClickSelected = (item) => {
  selected.value = item.id;
};

const current = (item) => {
  return selected.value === item.id;
};
</script>
