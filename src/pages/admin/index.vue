<template>
  <nuxt-layout name="admin">
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
        <TabBlock v-model:selected="selectedTab" :list="tabsList" />
        <MainBlock
          v-show="selectedTab === 'LIST'"
          v-model:bookList="bookList"
          v-model:topicList="topicList"
          v-model:purchasePlaceList="purchasePlaceList"
          :img-null-cnt="imgNullCnt"
        />
        <StatBlock v-show="selectedTab === 'STAT'" :book-list="bookList" />
      </div>
    </template>
    <Spinner v-if="status.isLoading" />
  </nuxt-layout>
</template>
<script setup>
import { nextTick, ref, watch, reactive, onUnmounted } from 'vue';
import { uniq } from 'lodash';
import FileSelect from '~/components/admin/FileSelect';
import demoFile from '~/assets/demoData.json';
import Container from '~/components/common/Container';
import Spinner from '~/components/common/Spinner';
import MainBlock from '~/components/admin/MainBlock';
import { Book } from '~/models/book';
import StatBlock from '../../components/admin/StatBlock';
import TabBlock from '../../components/admin/TabBlock';

const selectedFile = ref(null);

const bookList = ref([]);
const topicList = ref([]);
const purchasePlaceList = ref([]);
const imgNullCnt = ref(0);

const status = reactive({
  isLoading: false,
  isSelectedFile: false,
});

const selectedTab = ref('LIST');
const tabsList = [
  { name: '목록', id: 'LIST' },
  { name: '통계', id: 'STAT' },
];

onUnmounted(() => {
  bookList.value = [];
  topicList.value = [];
  purchasePlaceList.value = [];
  imgNullCnt.value = 0;
  status.isLoading = false;
  status.isSelectedFile = false;
});

watch(
  () => bookList.value,
  () => {
    console.log('changed');
    loadAfter();
  },
  { deep: true },
);

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

const loadAfter = () => {
  const topicAllList = bookList.value.map((item) => item.topic);
  const purchasePlaceAllList = bookList.value.map((item) => item.purchasePlace);
  topicList.value = uniq(topicAllList)
    .filter((item) => !!item)
    .sort();
  purchasePlaceList.value = uniq(purchasePlaceAllList)
    .filter((item) => !!item)
    .sort();

  const imageUrlNullList = bookList.value.filter((item) => !item.imageUrl);
  imgNullCnt.value = imageUrlNullList.length;
};

const onClickDemo = async () => {
  const tmp = demoFile;
  tmp.forEach((item) => {
    bookList.value.push(new Book(item));
  });
  status.isLoading = true;
  status.isSelectedFile = true;
};
</script>
