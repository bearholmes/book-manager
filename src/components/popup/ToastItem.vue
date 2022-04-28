<template>
  <div class="toast-item-wrap__block">
    <transition
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0">
      <div class="toast-item__block">
        <div class="p-4">
          <div class="flex items-center">
            <div class="w-0 flex-1 flex text-sm font-medium text-gray-900">
                {{ props.item.message }}
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button @click="close" class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span class="sr-only">닫기</span>
                <XIcon class="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script setup>
import { XIcon } from '@heroicons/vue/solid'
import { useStore } from '~/store/toast'
const store = useStore()
const props = defineProps({
  item: {
    type: Object,
    default: () => {
      return {
        message: null,
        class: null,
        timer: null,
        key: null
      }
    },
  },
})

const close = () => {
  store.REMOVE_TOAST_ITEM(props.item.key);
}
</script>
<style scoped>
.toast-item-wrap__block {
  @apply flex items-center my-1 sm:items-start
}

.toast-item__block {
@apply max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden
}
</style>