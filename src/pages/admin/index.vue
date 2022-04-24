<template>
  <div class="py-20">
    <main v-if="!isSelectedFile">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <FileSelect @select="readFile" />
        <p class="text-center p-5 text-gray-500">or</p>
        <div class="px-4 py-8 sm:px-0 bg-white border border-transparent rounded-md shadow-sm">
          <div class="px-4">
            <button
              type="button"
              class="block w-full items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              @click="newFile"
            >
              DEMO
            </button>
          </div>
        </div>
      </div>
    </main>
    <template v-else>
      <teleport to="#teleHeader">
        <div class="flex items-center">
          <button
            type="button"
            aria-label="추가"
            class="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            @click.prevent="add"
          >
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button
            type="button"
            class="hidden md:inline-flex ml-3 items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
            :disabled="bookList.length < 1"
            @click.prevent="save"
          >
            Export
          </button>
        </div>
      </teleport>
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-5">
            <div class="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt class="text-sm font-medium text-gray-500 truncate">보유 권수</dt>
              <dd class="mt-1 text-2xl text-gray-900">
                {{ currency(bookList.length) }}
              </dd>
            </div>
            <div class="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt class="text-sm font-medium text-gray-500 truncate">표지 이미지 누락 수</dt>
              <dd class="mt-1 text-2xl text-gray-900">
                {{ imgNullCnt }} <span class="text-gray-500 text-sm">({{ ((imgNullCnt / bookList.length) * 100).toFixed(1) }}%)</span>
              </dd>
            </div>
            <!--          <div class="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">-->
            <!--            <dt class="text-sm font-medium text-gray-500 truncate">-->
            <!--              test-->
            <!--            </dt>-->
            <!--            <dd class="mt-1 text-2xl  text-gray-900">-->
            <!--              1000-->
            <!--            </dd>-->
            <!--          </div>-->
          </dl>
        </div>
      </header>
      <main class="mt-7">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul role="list" class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <book-item v-for="(item, index) in bookList" :key="index" :item="item" :index="index" @open="openBook" />
          </ul>
        </div>
      </main>
      <!--SIDE-->
      <SidePop v-model:isShow="isShowSide" v-model:item="selectedBook" :index="selectedIdx" :topic-list="topicList" @delete="deleteItem" />
    </template>
  </div>
</template>
<script setup>
import { useState } from 'nuxt/app';
import { ref, watch } from 'vue';
import BookItem from '../../components/admin/BookItem';
import SidePop from '../../components/admin/SidePop';
import FileSelect from '../../components/admin/FileSelect';
import { uniq } from 'lodash';

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
    console.log('bookList');
    loadAfter();
  },
  { deep: true },
);

const readFile = (file) => {
  console.log(file.type);
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

import demoFile from '~/assets/demoData.json';
const newFile = async () => {
  bookList.value = demoFile;
  isSelectedFile.value = true;

  loadAfter();
};

const add = () => {
  alert('준비중');
};

const deleteItem = (index) => {
  bookList.value.splice(index, 1);
  loadAfter();
  isShowSide.value = false;
  // TODO 알림/토스트
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
</script>
<style scoped>
.on {
  @apply border-blue-300;
}
</style>
