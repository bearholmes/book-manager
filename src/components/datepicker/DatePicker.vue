<template>
  <datepicker
    v-model="value"
    locale="ko"
    :enable-time-picker="false"
    show-now-button
    :inline="props.inline"
    auto-apply
    :month-year-component="monthYear"
    :month-change-on-scroll="false"
    :format="format"
    position="left"
  >
    <template #now-button="{ selectCurrentDate }">
      <div class="mx-3 my-2 text-right">
        <button
          type="button"
          class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          @click="selectCurrentDate()"
        >
          오늘
        </button>
      </div>
    </template>
  </datepicker>
</template>
<script setup>
import Datepicker from '@vuepic/vue-datepicker';
import { computed, defineAsyncComponent } from 'vue';
import dayjs from 'dayjs';

const props = defineProps({
  inline: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: [Date, String],
    default: null,
  },
  format: {
    type: String,
    default: 'YYYY-MM-DD',
  },
});
const emit = defineEmits(['update:modelValue']);

const value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', dayjs(value).format(props.format));
  },
});

// Lazy load the component we want to pass
const MonthYear = defineAsyncComponent(() => import('./block/MonthYear.vue'));

// Return from computed as it is imported
const monthYear = computed(() => MonthYear);

const format = (date) => {
  return dayjs(date).format('YYYY-MM-DD');
};
</script>
<style>
.dp__menu {
  @apply px-5 pt-2 pb-3;
}
.dp__calendar {
  @apply text-sm;
}
.dp__calendar_header {
  @apply font-normal;
}
.dp__calendar_row + .dp__calendar_row {
  @apply border-t border-gray-200 pt-2;
}
.dp__active_date {
  @apply bg-gray-900 font-semibold !text-white;
}

.dp__today {
  @apply border-0 font-semibold text-blue-600;
}
.dp__input {
  @apply shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md py-2;
}

.dp__pointer {
  @apply rounded-full;
}
.dp__pointer {
  @apply rounded-md;
}
</style>
