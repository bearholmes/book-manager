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
              class="inline-flex items-center p-0.5 border border-gray-500 rounded-md shadow-sm text-gray-600 bg-white hover:bg-gray-200"
              @click.prevent="add"
            >
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
                  {{ currency(imgNullCnt) }} <span class="text-gray-500 text-sm">({{ ((imgNullCnt / bookList.length) * 100).toFixed(1) }}%)</span>
                </template>
              </StatusListItem>
            </StatusList>
          </Container>
        </header>
        <main>
          <Container class="mt-4 sm:mt-6">
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
                    class="absolute -top-7 bg-blue-800 rounded-md shadow-sm left-9 text-xs py-1 px-2 text-white"
                  >
                    <span class="sr-only">검색됨</span> {{ filterList.length }} 건
                  </p>
                </div>
              </div>
            </div>
          </Container>
          <Container class="mt-4 sm:mt-6">
            <ul role="list" class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              <BookItem v-for="(item, index) in filterList" :key="index" :item="item" :index="index" @open="openBook" />
            </ul>
          </Container>
        </main>
        <!--SIDE-->
        <SidePop v-model:isShow="isShowSide" v-model:item="selectedBook" :index="selectedIdx" :topic-list="topicList" @delete="openDeleteConfirm" />
      </template>

      <!-- 삭제 -->
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
  </nuxt-layout>
</template>
<script setup>
import { useState } from 'nuxt/app';
import { computed, ref, watch } from 'vue';
import BookItem from '~/components/admin/BookItem';
import SidePop from '~/components/admin/SidePop';
import FileSelect from '~/components/admin/FileSelect';
import Alert from '~/components/popup/Alert';
import demoFile from '~/assets/demoData.json';
import { uniq } from 'lodash';
import { DownloadIcon, SearchIcon, XCircleIcon } from '@heroicons/vue/solid';
import { ExclamationIcon } from '@heroicons/vue/outline';
import Container from '../../components/common/Container';
import StatusList from '../../components/admin/StatusList';
import StatusListItem from '../../components/admin/StatusListItem';

const selectedFile = ref(null);
const isSelectedFile = ref(false);
const topicList = ref([]);
const imgNullCnt = ref(0);

const bookList = useState('form', () => {
  return [];
});

watch(
  () => bookList.value,
  () => {
    loadAfter();
  },
  { deep: true },
);

const readFile = (file) => {
  if (file.type !== 'application/json') {
    alert('json 파일이 아닙니다.');
    return;
  }

  selectedFile.value = file;
  let reader = new FileReader();
  reader.onload = (e) => {
    // console.log(JSON.parse(e.target.result.toString()));
    bookList.value = JSON.parse(e.target.result.toString());
    isSelectedFile.value = true;

    loadAfter();
  };
  reader.readAsText(file);
};

const loadAfter = () => {
  const topicAllList = bookList.value.map((item) => item.topic);
  topicList.value = uniq(topicAllList).sort();

  const imageUrlNullList = bookList.value.filter((item) => !item.imageUrl);
  imgNullCnt.value = imageUrlNullList.length;
};

const newFile = async () => {
  bookList.value = demoFile;
  isSelectedFile.value = true;

  loadAfter();
};

const add = () => {
  alert('준비중');
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
  loadAfter();
  isShowSide.value = false;
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

const isShowSide = ref(false);
const selectedBook = ref({});
const selectedIdx = ref(null);

const openBook = (item, index) => {
  isShowSide.value = true;
  selectedBook.value = item;
  selectedIdx.value = index;
};

watch(
  () => isShowSide,
  (val) => {
    if (!val) {
      selectedBook.value = {};
      selectedIdx.value = null;
    }
  },
);

const currency = (value, nullTxt = '-') => {
  if (!value && value !== 0) {
    return nullTxt;
  }
  return value.toString().replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,');
};

const searchTxt = ref('');
const onInputSearchTxt = (e) => {
  searchTxt.value = e.target.value;
};

const filterList = computed(() => {
  if (!searchTxt.value) return bookList.value;

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
