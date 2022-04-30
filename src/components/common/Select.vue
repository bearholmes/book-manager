<template>
  <Listbox v-model="value" as="div">
    <slot name="label">
      <ListboxLabel :class="labelClass">{{ labelText }}</ListboxLabel>
    </slot>
    <div class="relative mt-1">
      <ListboxButton
        class="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <span class="block truncate" :class="value.name ? '' : 'text-gray-500'">
          <slot name="value" :item="value" :placeholder="placeholder">{{ value.name ? value.name : placeholder }}</slot>
        </span>
        <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <SelectorIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <ListboxOptions
          class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        >
          <ListboxOption v-for="(item, idx) in options" :key="idx" v-slot="{ active, selected }" as="template" :value="item">
            <li :class="[active ? 'text-white bg-blue-600' : 'text-gray-900', 'cursor-default select-none relative py-2 pl-3 pr-9']">
              <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">
                <slot name="name" :item="item">{{ item.name }}</slot>
              </span>
              <span v-if="selected" :class="[active ? 'text-white' : 'text-blue-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>
<script setup>
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue';
import { CheckIcon, SelectorIcon } from '@heroicons/vue/solid';
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => {},
  },
  options: {
    type: Array,
    default: () => {
      return [];
    },
  },
  labelText: {
    type: String,
    default: '선택상자',
  },
  placeholder: {
    type: String,
    default: '선택',
  },
  isShowLabel: {
    type: Boolean,
    default: false,
  },
});

const labelClass = computed(() => {
  return props.isShowLabel ? 'block text-sm font-medium text-gray-700' : 'sr-only';
});

const emits = defineEmits(['update:modelValue']);

const value = computed({
  set(val) {
    emits('update:modelValue', val);
  },
  get() {
    return props.modelValue;
  },
});
</script>
