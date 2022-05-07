<template>
  <li class="book-item__block tracking-tight">
    <a href="javascript:void(0);" @click="open">
      <div class="book-item-image__block" :style="bgImage" :class="{ blank: !props.item.imageUrl }"></div>
      <div class="-mt-px relative flex-row text-left p-4 pt-6 mb-12">
        <span v-if="item.topic" class="book-item-tag__block" :style="topicBg">
          {{ item.topic }}
        </span>
        <strong class="font-normal text-sm sm:text-base hover:text-blue-500 hover:underline">{{ item.bookName }}</strong>
      </div>
    </a>
    <div class="book-item-bottom__block">
      <div class="book-item-cell__block">
        <button v-if="item.publisher" type="button" class="book-item-cell__button" @click="search(item.publisher)">{{ item.publisher }}</button>
      </div>
      <div class="book-item-cell__block">
        <button v-if="item.author" type="button" class="book-item-cell__button" @click="search(item.author)">{{ item.author }}</button>
      </div>
    </div>
  </li>
</template>
<script setup>
import { computed } from 'vue';

const props = defineProps({
  index: {
    type: Number,
    default: null,
  },
  item: {
    type: Object,
    default: () => {
      return {};
    },
  },
  topicColor: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const emit = defineEmits(['open', 'search']);

/**
 * 수정 열기
 */
const open = () => {
  emit('open', props.item, props.index);
};

const search = (text) => {
  emit('search', text);
};

/**
 * 주제별 컬러셋 설정
 */
const topicBg = computed(() => {
  const color = props.topicColor[props.item.topic];
  return `background-color:${color};`;
});

/**
 * 배경이미지 주소 처리
 * @type {ComputedRef<string|string>}
 */
const bgImage = computed(() => {
  return props.item.imageUrl ? `background-image:url(${props.item.imageUrl})` : '';
});
</script>
<style scoped>
.book-item__block {
  @apply relative col-span-1 flex flex-col text-center bg-white rounded-lg shadow-sm divide-y divide-gray-200 overflow-hidden;
}
.book-item-tag__block {
  @apply absolute -top-3 left-2 px-2 py-1 text-xs font-medium rounded-full;
}

.book-item-image__block {
  @apply h-56 sm:h-64 md:h-72 lg:h-80 bg-clip-border bg-center bg-no-repeat bg-cover opacity-90;
}

.book-item-image__block.blank {
  @apply border-b border-dashed border-gray-600 bg-center opacity-20;
  background-size: 50px;
  background-image: url('@/assets/images/blank-image.png');
}

.book-item-bottom__block {
  @apply w-full absolute bottom-0 left-0 h-11 text-xs sm:text-sm text-gray-500;
}
.book-item-cell__block {
  @apply inline-block w-1/2 align-top overflow-hidden;
}
.book-item-cell__button {
  @apply p-3 truncate w-full;
}
</style>
