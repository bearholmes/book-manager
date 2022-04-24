<template>
  <div class="month-year-wrapper">
    <div class="custom-month-year-component">
      <select class="select-input" :value="props.month" @change="$emit('update:month', +$event.target.value)">
        <option v-for="m in props.months" :key="m.value" :value="m.value">
          {{ m.text }}
        </option>
      </select>
      <select class="select-input" :value="props.year" @change="$emit('update:year', +$event.target.value)">
        <option v-for="y in props.years" :key="y.value" :value="y.value">
          {{ y.text }}
        </option>
      </select>
    </div>
    <div class="icons">
      <button type="button" class="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500" @click="onPrev">
        <span class="sr-only">Previous month</span>
        <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
        @click="onNext"
      >
        <span class="sr-only">Next month</span>
        <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/solid';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  months: { type: Array, default: () => [] },
  years: { type: Array, default: () => [] },
  filters: { type: Object, default: null },
  monthPicker: { type: Boolean, default: false },
  month: { type: Number, default: 0 },
  year: { type: Number, default: 0 },
  customProps: { type: Object, default: null },
});
const emit = defineEmits(['update:month', 'update:year']);
const updateMonthYear = (month, year) => {
  emit('update:month', month);
  emit('update:year', year);
};
const onNext = () => {
  let month = props.month;
  let year = props.year;
  if (props.month === 11) {
    month = 0;
    year = props.year + 1;
  } else {
    month += 1;
  }
  updateMonthYear(month, year);
};

const onPrev = () => {
  let month = props.month;
  let year = props.year;
  if (props.month === 0) {
    month = 11;
    year = props.year - 1;
  } else {
    month -= 1;
  }
  updateMonthYear(month, year);
};
</script>

<style scoped>
.month-year-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 16px;
}
.custom-month-year-component {
  display: flex;
  justify-content: flex-start;
  flex: 1;
}

.select-input {
  @apply mt-1 block pl-3 pr-8 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md;
}
.select-input + .select-input {
  @apply ml-1.5;
}

.icons {
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
}
</style>
