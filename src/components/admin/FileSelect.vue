<template>
  <div class="px-4 py-8 sm:px-0 bg-white border border-transparent rounded-md shadow-sm">
    <div class="px-4">
      <div
        class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
        :class="{ on: isDropped }"
        @dragenter.prevent="setActive"
        @dragover.prevent="setActive"
        @dragleave.prevent="setInactive"
        @drop.prevent="onDrop"
      >
        <div class="space-y-1 text-center">
          <PicturePlus class="mx-auto h-12 w-12 text-gray-400" />
          <div class="flex text-sm text-gray-600">
            <label
              for="fileUpload"
              class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <span>파일선택</span>
              <input id="fileUpload" ref="fileUpload" type="file" accept="application/json" class="sr-only" @change="onFileChange" />
            </label>
            <p class="pl-1">또는 drag and drop</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import PicturePlus from '../icons/PicturePlus';

const emit = defineEmits(['select']);

const isDropped = ref(false);
let inDropTimeout = null;

const onDrop = (e) => {
  onFileChange(e);
  setInactive();
};
const setActive = () => {
  isDropped.value = true;
  clearTimeout(inDropTimeout);
};
const setInactive = () => {
  inDropTimeout = setTimeout(() => {
    isDropped.value = false;
  }, 50);
};

const preventDefaults = (e) => {
  e.preventDefault();
};

const onFileChange = (e) => {
  let files = e.target.files || e.dataTransfer.files;
  if (!files.length) return;
  emit('select', files[0]);
};

const events = ['dragenter', 'dragover', 'dragleave', 'drop'];
onMounted(() => {
  events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults);
  });
});

onUnmounted(() => {
  // console.log('onUnmounted');
  events.forEach((eventName) => {
    document.body.removeEventListener(eventName, preventDefaults);
  });
});
</script>
<style scoped>
.on {
  @apply border-blue-300;
}
</style>
