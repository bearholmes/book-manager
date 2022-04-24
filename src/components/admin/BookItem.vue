<template>
  <li class="relative col-span-1 flex flex-col text-center bg-white rounded-lg shadow divide-y divide-gray-200 overflow-hidden">
    <a href="javascript:void(0);" @click="open">
      <div
        class="item"
        :style="props.item.imageUrl ? `background-image:url(${props.item.imageUrl})` : ''"
        :class="{ blank: !props.item.imageUrl }"
      ></div>
      <span class="absolute tag_type top-3.5 left-2 px-2 py-1 text-xs font-medium rounded-full" :class="topicClass">
        {{ item.topic }}
      </span>
      <div class="hover:text-blue-500 hover:underline">
        <div class="-mt-px flex divide-x divide-gray-200">
          <div class="w-0 flex-1 flex p-4 text-sm">
            <strong class="font-normal text-left">{{ item.bookName }}</strong>
          </div>
        </div>
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
        imageUrl: '',
        duplicated: '',
      };
    },
  },
});

const emit = defineEmits(['open']);

const open = () => {
  emit('open', props.item, props.index);
};

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
</script>
<style scoped>
.item {
  min-height: 286px;
  background-repeat: no-repeat;
  background-position: center center;
  background-clip: border-box;
  object-fit: cover;
  background-size: 286px;
  opacity: 0.9;
}

.item.blank {
  background-image: url('@/assets/images/blank-image.png');
  background-size: auto;
  opacity: 0.3;
  background-position: center center;
}
</style>
