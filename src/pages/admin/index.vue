<template>
  <nuxt-layout name="admin">
    <div class="py-20">
      <main v-if="!isSelectedFile">
        <Container>
          <FileSelect @select="readFile" />
          <p class="text-center p-2.5 text-gray-500">or</p>
          <div class="px-4 py-8 sm:px-0 bg-white border border-transparent rounded-md shadow-sm">
            <div class="px-4">
              <button
                type="button"
                class="block w-full items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                @click="newFile"
              >
                DEMO
              </button>
            </div>
          </div>
        </Container>
      </main>
      <template v-else>
        <teleport to="#teleHeader">
          <div class="flex items-center">
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
              @click.prevent="save"
            >
              <DownloadIcon class="h-4 w-4 mr-1.5 text-white">Export</DownloadIcon> <span class="mt-0.5">JSON</span>
            </button>
          </div>
        </teleport>
        <header>
          <Container>
            <StatusList>
              <StatusListItem>
                <template #dt> 보유 권수 </template>
                <template #dd> {{ currency(bookList.length) }} <span class="text-sm text-gray-500">권</span> </template>
              </StatusListItem>
              <StatusListItem v-if="imgNullCnt && imgNullCnt > 0">
                <template #dt> 표지 이미지 누락 수 </template>
                <template #dd>
                  <button type="button" @click="searchTxt = '!image'">{{ currency(imgNullCnt) }}</button>
                  <span class="text-gray-500 text-sm">권 ({{ ((imgNullCnt / bookList.length) * 100).toFixed(1) }}%)</span>
                </template>
              </StatusListItem>
            </StatusList>
          </Container>
        </header>
        <main ref="refContent">
          <Container class="sticky top-16 z-10 p-2 md:p-5 bg-gradient-to-b from-gray-100 to-transparent">
            <div class="flex justify-end items-center">
              <div class="w-full md:w-2/6 relative">
                <label for="search" class="sr-only">검색</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <div v-if="searchTxt.length > 0" class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" @click="searchTxt = ''">
                    <XCircleIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="search"
                    type="text"
                    :value="searchTxt"
                    autocomplete="off"
                    class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
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
              <BookItem v-for="(item, index) in filterList" :key="index" :item="item" :index="index" @open="openBook" @search="searchBook" />
              <NewItem @create="createBook" />
            </ul>
          </Container>
        </main>
        <!--SIDE-->
        <SidePopEdit
          v-model:isShow="isShowSideEdit"
          v-model:item="selectedBook"
          :index="selectedIdx"
          :topicList="topicList"
          :purchasePlaceList="purchasePlaceList"
          @delete="openDeleteConfirm"
        />
        <SidePopNew
            v-model:isShow="isShowSideNew"
            :topicList="topicList"
            :purchasePlaceList="purchasePlaceList"
            @create="addBook"
        />

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
      </template>
      <Spinner v-if="isLoading" />
    </div>
  </nuxt-layout>
</template>
<script setup>
import { useState } from 'nuxt/app';
import {computed, onMounted, ref, watch} from 'vue';
import BookItem from '~/components/admin/BookItem';
import SidePopEdit from '~/components/admin/SidePopEdit';
import FileSelect from '~/components/admin/FileSelect';
import Alert from '~/components/popup/Alert';
import demoFile from '~/assets/demoData.json';
import {uniq} from 'lodash';
import { DownloadIcon, SearchIcon, XCircleIcon } from '@heroicons/vue/solid';
import { ExclamationIcon } from '@heroicons/vue/outline';
import Container from '../../components/common/Container';
import StatusList from '../../components/admin/StatusList';
import StatusListItem from '../../components/admin/StatusListItem';
import Spinner from '../../components/common/Spinner';
import {debounce, currency} from "../../utils/common";

const selectedFile = ref(null);
const isSelectedFile = ref(false);
const isLoading = ref(false);
const topicList = ref([]);
const purchasePlaceList = ref([]);
const imgNullCnt = ref(0);
const refContent = ref(null);
const refList = ref(null);

const bookList = useState('form', () => {
  return [];
});

import { useStore as useToastStore } from '~/store/toast';
import NewItem from '../../components/admin/NewItem';
import SidePopNew from '../../components/admin/SidePopNew';
const toastStore = useToastStore();

watch(
  () => bookList.value,
  () => {
    console.log('changed')
    loadAfter();
  },
  { deep: true },
);

const readFile = (file) => {
  if (file.type !== 'application/json') {
    alert('json 파일이 아닙니다.');
    return;
  }
  isLoading.value = true;
  selectedFile.value = file;
  let reader = new FileReader();
  reader.onload = (e) => {
    // console.log(JSON.parse(e.target.result.toString()));
    bookList.value = JSON.parse(e.target.result.toString());
    isSelectedFile.value = true;
  };
  reader.readAsText(file);
};

const loadAfter = () => {
  // isLoading.value = true;
  const topicAllList = bookList.value.map((item) => item.topic);
  const purchasePlaceAllList = bookList.value.map((item) => item.purchasePlace);
  topicList.value = uniq(topicAllList).sort();
  purchasePlaceList.value = uniq(purchasePlaceAllList).sort();

  const imageUrlNullList = bookList.value.filter((item) => !item.imageUrl);
  imgNullCnt.value = imageUrlNullList.length;
  // isLoading.value = false;
};

const newFile = async () => {
  isLoading.value = true;
  bookList.value = demoFile;
  isSelectedFile.value = true;
};

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

const isShowDeleteConfirm = ref(false);

const openDeleteConfirm = (index) => {
  // console.log('openDeleteConfirm');
  isShowDeleteConfirm.value = true;
  selectedIdx.value = index;
};

const closeDeleteConfirm = () => {
  // console.log('closeDeleteConfirm');
  isShowDeleteConfirm.value = false;
};

const deleteItem = () => {
  // console.log('deleteItem');
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

const save = () => {
  // TODO 저장을 바로 하지 않게하고,이름 바꿀수 있는 레이어 띄우기
  downloadObjectAsJson(bookList.value, 'bookData');
};

const downloadObjectAsJson = (exportObj, exportName) => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', exportName + '.json');
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

const isShowSideEdit = ref(false);
const isShowSideNew = ref(false);
const selectedBook = ref({});
const selectedIdx = ref(null);

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
}
const setDebounceTxt = debounce((e) => {
  searchTxt.value = e.target.value;
},150, false);

const filterList = computed(() => {
  if (!searchTxt.value) return bookList.value;
  if (searchTxt.value === '!image') return bookList.value.filter((item) => !item.imageUrl);

  return bookList.value.filter((item) => {
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
});
</script>
<style scoped>
.on {
  @apply border-blue-300;
}
</style>
