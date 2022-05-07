<template>
  <div>
    <teleport to="#teleHeader">
      <div class="flex items-center">
        <div class="mr-2 md:mr-5">
          <div class="mt-1 text-xs md:text-sm text-gray-500">총 {{ currency(bookList.length) }}권</div>
        </div>
        <button
          type="button"
          aria-label="추가"
          class="inline-flex items-center p-0.5 border rounded-md shadow-sm text-gray-700 border-gray-400 border-dashed hover:border-gray-600"
          @click.prevent="createBook"
        >
          <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          type="button"
          class="hidden md:inline-flex ml-3 items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          :disabled="bookList.length < 1"
          @click.prevent="openSaveConfirm"
        >
          <DownloadIcon class="h-4 w-4 mr-1.5 text-white">Export</DownloadIcon> <span class="mt-0.5">JSON</span>
        </button>
      </div>
    </teleport>

    <div v-if="isShowImgNullAlert" class="fixed bottom-0 left-0 right-0 z-10 bg-red-400 bg-opacity-90">
      <div class="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between flex-wrap">
          <div class="w-0 flex-1 flex items-center">
            <span class="flex p-1.5 rounded-lg bg-red-500">
              <SpeakerphoneIcon class="h-4 w-4 text-white" aria-hidden="true" />
            </span>
            <p class="ml-3 font-medium text-white text-sm truncate">
              <span class="mr-1.5">표지 이미지 누락 :</span>
              <button type="button" @click="searchTxt = '!image'">{{ currency(props.imgNullCnt) }}</button>
              <span>권 ({{ ((props.imgNullCnt / bookList.length) * 100).toFixed(1) }}%)</span>
            </p>
          </div>
          <div class="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <button
              type="button"
              class="-mr-1 flex p-2 rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
              @click="isShowImgNullAlert = false"
            >
              <span class="sr-only">닫기</span>
              <XIcon class="h-4 w-4 text-white" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
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
          <NewItem @create="createBook" />
        </ul>
      </Container>
    </main>
    <!--SIDE-->
    <SidePopEdit
      v-model:isShow="isShowSideEdit"
      v-model:item="selectedBook"
      v-model:topic-list="topicList"
      v-model:purchase-place-list="purchasePlaceList"
      :index="selectedIdx"
      @delete="openDeleteConfirm"
    />
    <SidePopNew v-model:isShow="isShowSideNew" v-model:topic-list="topicList" v-model:purchase-place-list="purchasePlaceList" @create="addBook" />

    <!-- 저장 알럿 -->
    <Alert v-model:isShow="isShowSaveConfirm">
      <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
        <DownloadIcon class="h-6 w-6 text-blue-600" aria-hidden="true" />
      </div>
      <div class="mt-3 text-center sm:mt-2 sm:ml-4 sm:text-left">
        <strong class="block text-lg leading-6 font-medium text-gray-900"> JSON 파일을 저장하시겠습니까? </strong>
      </div>
      <template #footer>
        <button
          type="button"
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm"
          @click="saveJson"
        >
          저장
        </button>
        <button
          type="button"
          class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
          @click="closeSaveConfirm"
        >
          취소
        </button>
      </template>
    </Alert>

    <!-- 삭제 알럿 -->
    <Alert v-model:isShow="isShowDeleteConfirm">
      <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
        <ExclamationIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
      </div>
      <div class="mt-3 text-center sm:mt-2 sm:ml-4 sm:text-left">
        <strong class="block text-lg leading-6 font-medium text-gray-900"> 삭제하시겠습니까? </strong>
      </div>
      <template #footer>
        <button
          type="button"
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
          @click="deleteItem"
        >
          삭제
        </button>
        <button
          type="button"
          class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
          @click="closeDeleteConfirm"
        >
          취소
        </button>
      </template>
    </Alert>
  </div>
</template>
<script setup>
import { currency, debounce } from '~/utils/common';
import { orderBy } from 'lodash';
import { computed, ref, watch } from 'vue';
import { DownloadIcon, SearchIcon, XCircleIcon, SortAscendingIcon, SortDescendingIcon } from '@heroicons/vue/solid';
import { ExclamationIcon, SpeakerphoneIcon, XIcon } from '@heroicons/vue/outline';
import BookItem from '~/components/common/BookItem';
import SidePopEdit from '~/components/admin/SidePopEdit';
import Alert from '~/components/popup/Alert';
import Container from '~/components/common/Container';
import NewItem from '~/components/admin/NewItem';
import SidePopNew from '~/components/admin/SidePopNew';
import Select from '~/components/common/Select';
// import StatusList from '~/components/admin/StatusList';
// import StatusListItem from '~/components/admin/StatusListItem';

import { useStore as useToastStore } from '~/store/toast';
const toastStore = useToastStore();

const props = defineProps({
  bookList: {
    type: Array,
    default: () => {
      return [];
    },
  },
  topicList: {
    type: Array,
    default: () => {
      return [];
    },
  },
  purchasePlaceList: {
    type: Array,
    default: () => {
      return [];
    },
  },
  imgNullCnt: {
    type: Number,
    default: 0,
  },
  topicColor: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const emits = defineEmits(['update:bookList', 'update:topicList', 'update:purchasePlaceList']);

const bookList = computed({
  get() {
    return props.bookList;
  },
  set(val) {
    emits('update:bookList', val);
  },
});

const topicList = computed({
  get() {
    return props.topicList;
  },
  set(val) {
    emits('update:topicList', val);
  },
});
const purchasePlaceList = computed({
  get() {
    return props.purchasePlaceList;
  },
  set(val) {
    emits('update:purchasePlaceList', val);
  },
});

const refContent = ref(null);
const refList = ref(null);
const isShowImgNullAlert = ref(false);

const isShowDeleteConfirm = ref(false);
const isShowSaveConfirm = ref(false);
const isShowSideEdit = ref(false);
const isShowSideNew = ref(false);
const selectedBook = ref({});
const selectedIdx = ref(null);

const createBook = () => {
  isShowSideNew.value = true;
};

const addBook = (item) => {
  bookList.value.push(item);
  isShowSideNew.value = false;
  const nodes = refList.value.childNodes;
  console.log(nodes[nodes.length - 1].offsetTop);
  window.scrollTo(0, nodes[nodes.length - 1].offsetTop);
  setTimeout(() => {
    toastStore.OPEN_TOAST({
      msg: '등록되었습니다.',
      timer: 3000,
    });
  }, 500);
};

const openDeleteConfirm = (index) => {
  isShowDeleteConfirm.value = true;
  selectedIdx.value = index;
};

const closeDeleteConfirm = () => {
  isShowDeleteConfirm.value = false;
};

const deleteItem = () => {
  isShowDeleteConfirm.value = false;
  const index = selectedIdx.value;
  bookList.value.splice(index, 1);
  isShowSideEdit.value = false;
  setTimeout(() => {
    toastStore.OPEN_TOAST({
      msg: '삭제되었습니다.',
      timer: 3000,
    });
  }, 500);
};

const openSaveConfirm = () => {
  isShowSaveConfirm.value = true;
};
const closeSaveConfirm = () => {
  isShowSaveConfirm.value = false;
};

const saveJson = () => {
  // TODO 이름 바꿀수 있는 레이어 처리
  const tmp = orderBy(bookList.value, ['purchaseDate'], ['asc']);
  downloadObjectAsJson(tmp, 'bookData');
};

const downloadObjectAsJson = (exportObj, exportName) => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', exportName + '.json');
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
  isShowSaveConfirm.value = false;
};

const openBook = (item, index) => {
  isShowSideEdit.value = true;
  selectedBook.value = item;
  selectedIdx.value = index;
};

const searchBook = (text) => {
  searchTxt.value = text;
  window.scrollTo(0, refContent.value.offsetTop);
};
watch(
  () => isShowSideEdit,
  (val) => {
    if (!val) {
      selectedBook.value = {};
      selectedIdx.value = null;
    }
  },
);

const searchTxt = ref('');
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

watch(
  () => props.imgNullCnt,
  (val) => {
    if (val > 0) isShowImgNullAlert.value = true;
  },
);
</script>
