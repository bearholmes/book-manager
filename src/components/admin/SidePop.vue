<template>
  <TransitionRoot
    :show="props.isShow"
    enter="transition-opacity duration-75"
    enter-from="opacity-0"
    enter-to="opacity-100"
    leave="transition-opacity duration-150"
    leave-from="opacity-100"
    leave-to="opacity-0"
  >
    <teleport to="body">
      <div class="fixed z-20 inset-0 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
        <div class="absolute inset-0 overflow-hidden">
          <TransitionChild
            enter="ease-in-out duration-300"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="ease-in-out duration-500"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <div class="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </TransitionChild>
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <TransitionChild
              as="template"
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enter-from="translate-x-full"
              enter-to="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leave-from="translate-x-0"
              leave-to="translate-x-full"
            >
              <div class="pointer-events-auto relative detail">
                <TransitionChild
                  enter="ease-in-out duration-300"
                  enter-from="opacity-0"
                  enter-to="opacity-100"
                  leave="ease-in-out duration-500"
                  leave-from="opacity-100"
                  leave-to="opacity-0"
                >
                  <div class="absolute top-0 left-0 -ml-8 flex sm:-ml-12">
                    <button
                      type="button"
                      class="p-3 rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                      @click="close"
                    >
                      <span class="sr-only">닫기</span>
                      <XIcon class="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </TransitionChild>
                <div class="h-full overflow-y-scroll bg-white bg-opacity-90 p-6">
                  <form class="space-y-8 divide-y divide-gray-200">
                    <div class="divide-y divide-gray-200">
                      <div v-if="book.imageUrl" class="flex justify-center">
                        <img :src="book.imageUrl" alt="" class="object-cover block overflow-hidden rounded-lg" style="max-width: 240px" />
                      </div>
                      <div class="!border-t-0 mt-8">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">도서정보</h3>
                      </div>
                      <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
                        <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                          <label for="bookName" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"> 도서명 </label>
                          <div class="mt-1 sm:mt-0 sm:col-span-2">
                            <div class="max-w-lg block w-full sm:max-w-xs">
                              <textarea
                                id="bookName"
                                v-model="book.bookName"
                                rows="3"
                                class="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                        </div>

                        <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                          <label for="imageUrl" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"> 표지 이미지 </label>
                          <div class="mt-1 sm:mt-0 sm:col-span-2">
                            <input
                              id="imageUrl"
                              v-model="book.imageUrl"
                              type="text"
                              autocomplete="family-name"
                              class="max-w-lg block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                            />
                            <div>
                              <button
                                type="button"
                                class="mt-3 inline-block bg-white py-1 px-2 border border-gray-300 rounded-md shadow-sm text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                @click="book.imageUrl = `./images/${book.ISBN13 || ''}.jpg`"
                              >
                                {ISBN13}.jpg 입력
                              </button>
                              <span class="inline-block ml-3 text-xs text-gray-500">/public/images/에 이미지를 저장하세요.</span>
                            </div>
                          </div>
                        </div>

                        <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                          <label for="isbn" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"> ISBN 13 </label>
                          <div class="mt-1 sm:mt-0 sm:col-span-2">
                            <input
                              id="isbn"
                              v-model="book.ISBN13"
                              type="text"
                              class="max-w-lg block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                          <label for="author" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"> 저자 </label>
                          <div class="mt-1 sm:mt-0 sm:col-span-2">
                            <input
                              id="author"
                              v-model="book.author"
                              type="text"
                              class="max-w-lg block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                          <label for="publisher" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"> 출판사 </label>
                          <div class="mt-1 sm:mt-0 sm:col-span-2">
                            <input
                              id="publisher"
                              v-model="book.publisher"
                              type="text"
                              class="max-w-lg block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        <Combobox
                          v-model="book.topic"
                          as="div"
                          class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5"
                        >
                          <ComboboxLabel for="topic" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"> 카테고리 </ComboboxLabel>
                          <div class="mt-1 sm:mt-0 sm:col-span-2">
                            <div class="max-w-lg block w-full sm:max-w-xs">
                              <div class="relative mt-1">
                                <ComboboxInput
                                  class="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                  @change="query = $event.target.value"
                                />
                                <!--                                  :display-value="(item) => {return item}"-->
                                <ComboboxButton class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                                  <SelectorIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </ComboboxButton>

                                <ComboboxOptions
                                  v-if="filtered.length > 0"
                                  class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                                >
                                  <ComboboxOption
                                    v-for="filterItem in filtered"
                                    :key="filterItem"
                                    v-slot="{ active, selected }"
                                    :value="filterItem"
                                    as="template"
                                  >
                                    <li
                                      :class="[
                                        'relative cursor-default select-none py-2 pl-3 pr-9',
                                        active ? 'bg-blue-600 text-white' : 'text-gray-900',
                                      ]"
                                    >
                                      <span :class="['block truncate', selected && 'font-semibold']">
                                        {{ filterItem }}
                                      </span>

                                      <span
                                        v-if="selected"
                                        :class="['absolute inset-y-0 right-0 flex items-center pr-4', active ? 'text-white' : 'text-blue-600']"
                                      >
                                        <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    </li>
                                  </ComboboxOption>
                                </ComboboxOptions>
                              </div>
                            </div>
                          </div>
                        </Combobox>

                        <div class="sm:border-t sm:border-gray-200 sm:pt-5">
                          <h3 class="text-lg leading-6 font-medium text-gray-900 mt-5">구매정보</h3>
                          <!--                            <p class="mt-1 max-w-2xl text-sm text-gray-500">상세 내용을 확인하거나 수정할 수 있습니다.</p>-->
                        </div>

                        <div class="space-y-6 sm:space-y-5 divide-y divide-gray-200 sm:border-t sm:border-gray-200 sm:pt-5">
                          <div role="group" aria-labelledby="label-notifications">
                            <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-baseline">
                              <div>
                                <div id="label-notifications" class="text-base font-medium text-gray-900 sm:text-sm sm:text-gray-700">상태</div>
                              </div>
                              <div class="sm:col-span-2">
                                <div class="max-w-lg">
                                  <div class="flex items-start sm:pt-2">
                                    <div v-for="(condition, cIdx) in conditionList" :key="cIdx" class="flex items-center">
                                      <input
                                        :id="`condition_${cIdx}`"
                                        v-model="book.condition"
                                        name="condition"
                                        type="radio"
                                        class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                        :class="{ 'ml-6': cIdx > 0 }"
                                        :value="condition.value"
                                      />
                                      <label :for="`condition_${cIdx}`" class="ml-3 block text-sm font-medium text-gray-700">
                                        {{ condition.label }}
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                          <label for="city" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"> 구매일 </label>
                          <div class="mt-1 sm:mt-0 sm:col-span-2">
                            <div class="max-w-lg block w-full sm:max-w-xs">
                              <DatePicker v-model="book.purchaseDate" />
                            </div>
                          </div>
                        </div>

                        <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                          <label for="purchasePlace" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"> 구매처 </label>
                          <div class="mt-1 sm:mt-0 sm:col-span-2">
                            <input
                              id="purchasePlace"
                              v-model="book.purchasePlace"
                              type="text"
                              class="max-w-lg block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                          <label for="purchasePrice" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"> 구매가 </label>
                          <div class="mt-1 sm:mt-0 sm:col-span-2">
                            <div class="max-w-lg block w-full sm:max-w-xs">
                              <div class="relative rounded-md shadow-sm">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span class="text-gray-500 sm:text-sm"> {{ currency }} </span>
                                </div>
                                <input
                                  id="purchasePrice"
                                  v-model.number="book.purchasePrice"
                                  type="text"
                                  class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                />
                                <div class="absolute inset-y-0 right-0 flex items-center">
                                  <label for="currency" class="sr-only">통화단위</label>
                                  <select
                                    v-model="book.currency"
                                    class="focus:ring-blue-500 focus:border-blue-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                                  >
                                    <option value="KRW">KRW</option>
                                    <option value="USD">USD</option>
                                    <option value="JPY">JPY</option>
                                    <option value="EUR">EUR</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                          <span class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"> 중복여부 </span>
                          <div class="mt-1 sm:mt-0 sm:col-span-2">
                            <div class="relative flex items-start sm:pt-2">
                              <div class="flex items-center h-5">
                                <input
                                  id="duplicated"
                                  v-model="book.duplicated"
                                  :true-value="true"
                                  :false-value="false"
                                  type="checkbox"
                                  class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                              </div>
                              <div class="ml-3 text-sm">
                                <label for="duplicated" class="font-medium text-gray-700">2권이상 보유</label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="pt-5">
                      <div class="flex">
                        <div class="flex flex-1 justify-start">
                          <button
                            type="button"
                            class="bg-red-500 py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            @click="deleteBook"
                          >
                            삭제
                          </button>
                        </div>
                        <div class="flex justify-end">
                          <button
                            type="button"
                            class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            @click="close"
                          >
                            닫기
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </TransitionChild>
          </div>
        </div>
      </div>
    </teleport>
  </TransitionRoot>
</template>

<script setup>
import {watch, ref, computed, onMounted, onUnmounted} from 'vue';
import {
  TransitionChild,
  TransitionRoot,
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxLabel,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/vue';
import { XIcon } from '@heroicons/vue/outline';
import DatePicker from '~/components/datepicker/DatePicker';
import { CheckIcon, SelectorIcon } from '@heroicons/vue/solid';

const props = defineProps({
  isShow: {
    type: Boolean,
  },
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
  topicList: {
    type: Array,
    default: () => {
      return [];
    },
  },
});

const book = computed({
  get() {
    return props.item;
  },
  set(value) {
    emit('update:item', value);
  },
});

const currency = ref('');
watch(
  () => props.item,
  (val) => {
    if (val.currency === 'KRW') {
      currency.value = '₩';
    } else if (val.currency === 'USD') {
      currency.value = '$';
    } else if (val.currency === 'JPY') {
      currency.value = '¥';
    } else if (val.currency === 'EUR') {
      currency.value = '€';
    } else {
      currency.value = '';
    }
  },
  { deep: true },
);

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

const emit = defineEmits(['update:isShow', 'delete']);

const close = () => {
  emit('update:isShow', false);
};

const query = ref('');
const filtered = computed(() =>
  query.value === ''
    ? props.topicList
    : props.topicList.filter((item) => {
        return item.toLowerCase().includes(query.value.toLowerCase());
      }),
);

const conditionList = ref([]);
conditionList.value = [
  { value: '신품', label: '신품' },
  { value: '중고', label: '중고' },
];

const deleteBook = () => {
  emit('delete', props.index);
};

const keyEvtListener = (e) => {
  if (e.key === 'Escape') {
    close();
  }
}
onMounted(()=>{
   document.addEventListener("keydown", keyEvtListener);
})
onUnmounted(()=>{
  document.removeEventListener(keyEvtListener)
})
</script>
<style scoped>
.detail {
  width: 600px;
}
</style>
