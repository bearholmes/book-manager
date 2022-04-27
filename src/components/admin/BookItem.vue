<template>
  <li class="book-item__block tracking-tight">
    <a href="javascript:void(0);" @click="open">
      <div class="book-item-image__block" :style="bgImage" :class="{ blank: !props.item.imageUrl }"></div>
      <div class="-mt-px relative flex-row text-left p-4 pt-6 pb-12">
        <span class="book-item-tag__block" :class="topicClass">
          {{ item.topic }}
        </span>
        <strong class="font-normal text-sm sm:text-base hover:text-blue-500 hover:underline ">{{ item.bookName }}</strong>
      </div>
      <div class="w-full absolute bottom-0 left-0 h-11 text-xs sm:text-sm text-gray-500">
        <div class="inline-block w-1/2 p-3 align-top truncate">{{ item.publisher }}</div>
        <div class="inline-block w-1/2 p-3 align-top truncate">{{ item.author }}</div>
      </div>
    </a>
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
      return {
        bookName: null,
        ISBN13: null,
        condition: null,
        purchasePrice: null,
        currency: 'KRW',
        purchaseDate: null,
        purchasePlace: null,
        author: null,
        topic: null,
        publisher: null,
        imageUrl: null,
        duplicated: null,
        comment: null,
      };
    },
  },
});

const emit = defineEmits(['open']);

/**
 * 수정 열기
 */
const open = () => {
  emit('open', props.item, props.index);
};

/**
 * 주제별 컬러셋 설정
 * @type {ComputedRef<*|string>}
 */
const topicClass = computed(() => {
  const colorSet = {
    가죽공예: 'bg-orange-200',
    기타: 'bg-stone-200',
    라탄: 'bg-amber-200',
    무크: 'bg-purple-200',
    양모자수: 'bg-rose-200',
    양모펠트: 'bg-pink-200',
    에코크래프트: 'bg-green-200',
    자수: 'bg-violet-200',
    코바늘: 'bg-cyan-200',
    펀치니들: 'bg-blue-200',
    펠트: 'bg-indigo-200',
    폼폼: 'bg-sky-200',
  };
  return props.item.topic ? colorSet[props.item.topic] : 'bg-slate-200';
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
  @apply relative col-span-1 flex flex-col text-center bg-white rounded-lg shadow divide-y divide-gray-200 overflow-hidden;
}
.book-item-tag__block {
  @apply absolute -top-3 left-2 px-2 py-1 text-xs font-medium rounded-full;
}

.book-item-image__block {
  @apply h-56 sm:h-64 md:h-72 lg:h-80 bg-clip-border bg-center bg-no-repeat bg-cover opacity-90;
}

.book-item-image__block.blank {
  @apply border-b border-dashed border-gray-400 bg-center opacity-10;
  background-size: 50px;
  background-image: url('@/assets/images/blank-image.png');
}
</style>
