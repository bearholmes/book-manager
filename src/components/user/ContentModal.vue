<template>
  <TransitionRoot as="template" :show="props.isShow">
    <div class="fixed z-30 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        </TransitionChild>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 translate-y-0 sm:scale-100"
          leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div
            class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:mx-2 sm:align-middle w-full sm:max-w-2xl"
          >
            <div class="block absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                @click="close"
              >
                <span class="sr-only">닫기</span>
                <XIcon class="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div class="px-4 py-5 sm:px-6">
              <div class="flex flex-col sm:flex-row items-start sm:items-center">
                <div v-if="book.imageUrl" class="sm: mr-6 mb-3 sm:mb-1">
                  <img :src="book.imageUrl" alt="" class="object-cover block overflow-hidden rounded-lg" style="max-width: 90px" />
                </div>
                <h3 class="text-lg leading-6 font-medium text-gray-900 pr-8">
                  {{ book.bookName || '-' }}
                </h3>
              </div>
              <p class="mt-3 max-w-2xl text-sm text-gray-500 leading-6">
                <span v-if="book.topic" class="book-item-tag__block" :class="topicClass">
                  {{ book.topic }}
                </span>
                <span class="inline-block ml-2">{{ book.ISBN13 }}</span>
              </p>
            </div>
            <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl class="sm:divide-y sm:divide-gray-200">
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">저자</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ book.author || '-' }}</dd>
                </div>
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">출판사</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ book.publisher || '-' }}</dd>
                </div>
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">출간일</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ book.publicationDate || '-' }}</dd>
                </div>
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">구매일</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ book.purchaseDate || '-' }}</dd>
                </div>

                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">구매처</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ book.purchasePlace || '-' }}</dd>
                </div>
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">상태</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ book.condition || '-' }}</dd>
                </div>
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">구매가</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ book.currency }} {{ currency(book.purchasePrice) }}</dd>
                </div>
                <div v-if="book.purchasePriceSec" class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">직구가</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ book.currencySec }} {{ currency(book.purchasePriceSec) }}</dd>
                </div>
                <div v-if="book.duplicated" class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">중복여부</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ book.duplicated ? '2권이상' : '-' }}</dd>
                </div>
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">메모</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ book.comment || '-' }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </TransitionChild>
      </div>
    </div>
  </TransitionRoot>
</template>

<script setup>
import { TransitionChild, TransitionRoot } from '@headlessui/vue';
import { computed, watch } from 'vue';
import { XIcon } from '@heroicons/vue/outline';
import { currency } from '~/utils/common';

const props = defineProps({
  isShow: {
    type: Boolean,
  },
  item: {
    type: Object,
    default: () => {
      return {};
    },
  },
});
const emits = defineEmits(['update:isShow']);

const book = computed(() => props.item);

watch(
  () => props.isShow,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = null;
    }
  },
);

const close = () => {
  emits('update:isShow', false);
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
  return book.value.topic ? colorSet[book.value.topic] : 'bg-slate-200';
});
</script>
<style scoped>
.book-item-tag__block {
  @apply px-2 py-1 text-xs font-medium rounded-full;
}
</style>
