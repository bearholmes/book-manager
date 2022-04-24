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
          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
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
import { useState } from 'nuxt/app';
import { onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['select']);

const isDropped = useState('dragAndDropCapable', () => false);
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

const events = ['dragenter', 'dragover', 'dragleave', 'drop'];
onMounted(() => {
  console.log('onMounted');
  events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults);
  });
});

onUnmounted(() => {
  console.log('onUnmounted');
  events.forEach((eventName) => {
    document.body.removeEventListener(eventName, preventDefaults);
  });
});

const onFileChange = (e) => {
  let files = e.target.files || e.dataTransfer.files;
  if (!files.length) return;
  emit('select', files[0]);
};
</script>
