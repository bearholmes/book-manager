<template>
  <main ref="refContent">
    <Container class="sticky top-16 z-10 p-0.5 md:p-4 bg-gradient-to-b from-gray-100 to-transparent">
      <div class="flex justify-between items-center">
        <div class="w-4/12 md:w-2/12 relative mr-2 md:mr-0">
          <Select v-model="sort.selected" :options="sort.options" label-text="정렬" :is-show-label="false">
            <template #value="vProps">
              <SortAscendingIcon v-if="vProps.item.direction === 'asc'" class="inline-block h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <SortDescendingIcon v-else class="inline-block h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <span class="text-gray-700 text-xs sm:text-sm ml-1.5">{{ vProps.item.name }}</span>
            </template>
            <template #name="vProps">
              <SortAscendingIcon v-if="vProps.item.direction === 'asc'" class="inline-block h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <SortDescendingIcon v-else class="inline-block h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <span class="text-gray-700 text-xs sm:text-sm ml-1.5">{{ vProps.item.name }}</span>
            </template>
          </Select>
        </div>
        <div class="w-8/12 md:w-4/12 relative">
          <label for="search" class="sr-only">검색</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon class="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" aria-hidden="true" />
            </div>
            <div v-if="searchTxt.length > 0" class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" @click="searchTxt = ''">
              <XCircleIcon class="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="search"
              type="text"
              :value="searchTxt"
              autocomplete="off"
              class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-9 text-xs sm:text-sm border-gray-300 rounded-md leading-6"
              placeholder="검색"
              @input="onInputSearchTxt"
            />
            <p
              v-if="filterList.length !== bookList.length"
              class="absolute -bottom-7 bg-blue-200 rounded-md shadow-sm left-9 text-xs py-1 px-2 text-blue-700 bg-opacity-90"
            >
              <span class="sr-only">검색됨</span> {{ filterList.length }} 건
            </p>
          </div>
        </div>
      </div>
    </Container>
    <Container class="mt-4">
      <ul ref="refList" role="list" class="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        <BookItem
          v-for="(item, index) in filterList"
          :key="index"
          :item="item"
          :index="index"
          :topic-color="props.topicColor"
          @open="openBook"
          @search="searchBook"
        />
      </ul>
    </Container>
    <ContentModal v-model:is-show="isShowContent" :item="selectedBook" :topic-color="props.topicColor" />
  </main>
</template>
<script setup>
import { debounce } from '~/utils/common';
import { orderBy } from 'lodash';
import { computed, ref } from 'vue';
import { SearchIcon, XCircleIcon, SortAscendingIcon, SortDescendingIcon } from '@heroicons/vue/solid';
import BookItem from '~/components/common/BookItem';
import Container from '~/components/common/Container';
import Select from '~/components/common/Select';
import ContentModal from './ContentModal';

const props = defineProps({
  bookList: {
    type: Array,
    default: () => {
      return [];
    },
  },
  topicColor: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const bookList = computed(() => props.bookList);

const refContent = ref(null);
const refList = ref(null);

const isShowContent = ref(false);
const selectedBook = ref({});

const openBook = (item) => {
  isShowContent.value = true;
  selectedBook.value = item;
};

const searchTxt = ref('');
const searchBook = (text) => {
  searchTxt.value = text;
  window.scrollTo(0, refContent.value.offsetTop);
};
let onInputSearchTxt = (e) => {
  setDebounceTxt(e);
};
const setDebounceTxt = debounce(
  (e) => {
    searchTxt.value = e.target.value;
  },
  150,
  false,
);

const filterList = computed(() => {
  let tmp = [];
  if (!searchTxt.value) {
    tmp = bookList.value;
  } else if (searchTxt.value === '!image') {
    tmp = bookList.value.filter((item) => !item.imageUrl);
  } else {
    tmp = bookList.value.filter((item) => {
      const strIsbn = typeof item.ISBN13 === 'string' ? item.ISBN13 : item.ISBN13.toString();
      return (
        item.bookName.toLowerCase().includes(searchTxt.value.toLowerCase()) ||
        strIsbn.includes(searchTxt.value) ||
        item.condition.toLowerCase().includes(searchTxt.value.toLowerCase()) ||
        item.publisher.toLowerCase().includes(searchTxt.value.toLowerCase()) ||
        item.author.toLowerCase().includes(searchTxt.value.toLowerCase()) ||
        item.purchasePlace.toLowerCase().includes(searchTxt.value.toLowerCase()) ||
        item.topic.toLowerCase().includes(searchTxt.value.toLowerCase())
      );
    });
  }
  if (sort.value.selected.type === 'datetime') {
    return orderBy(tmp, [(item) => new Date(item[sort.value.selected.value]).getTime()], [sort.value.selected.direction]);
  } else if (sort.value.selected.type === 'number') {
    return orderBy(
      tmp,
      [(item) => (typeof item[sort.value.selected.value] === 'number' ? item[sort.value.selected.value] : parseInt(item[sort.value.selected.value]))],
      [sort.value.selected.direction],
    );
  } else {
    return orderBy(tmp, [sort.value.selected.value], [sort.value.selected.direction]);
  }
});

const sort = ref({
  selected: {
    name: '구매일',
    value: 'purchaseDate',
    direction: 'asc',
    type: 'datetime',
  },
  options: [
    {
      name: '도서명',
      value: 'bookName',
      direction: 'asc',
      type: 'string',
    },
    {
      name: '도서명',
      value: 'bookName',
      direction: 'desc',
      type: 'string',
    },
    {
      name: '구매일',
      value: 'purchaseDate',
      direction: 'asc',
      type: 'datetime',
    },
    {
      name: '구매일',
      value: 'purchaseDate',
      direction: 'desc',
      type: 'datetime',
    },
    {
      name: '출간일',
      value: 'publicationDate',
      direction: 'asc',
      type: 'datetime',
    },
    {
      name: '출간일',
      value: 'publicationDate',
      direction: 'desc',
      type: 'datetime',
    },
    {
      name: '구매가',
      value: 'purchasePrice',
      direction: 'asc',
      type: 'number',
    },
    {
      name: '구매가',
      value: 'purchasePrice',
      direction: 'desc',
      type: 'number',
    },
  ],
});
</script>
