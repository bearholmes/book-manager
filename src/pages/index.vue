<template>
  <nuxt-layout>
    <main v-if="!status.isSelectedFile">
      <div class="py-20">
        <Container>
          <FileSelect @select="readFile" />
          <p class="text-center p-2.5 text-gray-500">or</p>
          <div class="px-4 py-8 sm:px-0 bg-white border border-transparent rounded-md shadow-sm">
            <div class="px-4">
              <button
                type="button"
                class="block w-full items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                @click="onClickDemo"
              >
                DEMO
              </button>
            </div>
          </div>
        </Container>
      </div>
    </main>
    <template v-else>
      <div class="py-20">
        <MainBlock :book-list="bookList" :topic-color="topicColor" />
      </div>
    </template>
  </nuxt-layout>
</template>
<script setup>
import { nextTick, ref, reactive, onUnmounted } from 'vue';
import FileSelect from '~/components/admin/FileSelect';
import demoFile from '~/assets/demoData.json';
import Container from '~/components/common/Container';
import { Book } from '~/models/book';
import MainBlock from '~/components/user/MainBlock';
import { ColorQueue } from '../utils/common';
import { uniq } from 'lodash';
import { watch } from 'vue';

const selectedFile = ref(null);
const bookList = ref([]);
const topicColor = ref({});

const status = reactive({
  isLoading: false,
  isSelectedFile: false,
});

onUnmounted(() => {
  bookList.value = [];
  status.isLoading = false;
  status.isSelectedFile = false;
});

const readFile = (file) => {
  if (file.type !== 'application/json') {
    alert('json 파일이 아닙니다.');
    return;
  }
  status.isLoading = true;
  selectedFile.value = file;
  let reader = new FileReader();
  reader.onload = (e) => {
    const tmp = JSON.parse(e.target.result.toString());
    tmp.forEach((item) => {
      bookList.value.push(new Book(item));
    });
    nextTick(() => {
      status.isLoading = false;
      status.isSelectedFile = true;
    });
  };
  reader.readAsText(file);
};

const onClickDemo = async () => {
  const tmp = demoFile;
  tmp.forEach((item) => {
    bookList.value.push(new Book(item));
  });
  status.isLoading = true;
  status.isSelectedFile = true;
};

watch(
  () => bookList.value,
  () => {
    console.log('changed');
    loadAfter();
  },
  { deep: true },
);

const loadAfter = () => {
  const topicAllList = bookList.value.map((item) => item.topic);
  const topicList = uniq(topicAllList)
    .filter((item) => !!item)
    .sort();
  const colorSet = new ColorQueue();
  topicList.forEach((item) => {
    if (!topicColor.value[item]) {
      topicColor.value[item] = colorSet.dequeue();
    }
  });
};
</script>
