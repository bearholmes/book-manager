<template>
  <div className="h-full">
    <container class="pt-4 pb-8">
      <div class="mb-5 p-2 border-b-2 border-gray-300">
        <h1 class="text-2xl font-semibold text-gray-900">Open license</h1>
      </div>
      <div v-for="(item, idx) in list" :key="idx" class="block">
        <h3 class="text-lg leading-6 font-medium text-gray-900">{{ item.name }}</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">{{item.license}}</p>
        <div class="mt-5">
          <ul class="divide-y divide-gray-200 text-sm" v-for="(lItem, lIdx) in item.link" :key="lIdx">
            <li class="py-2"><a :href="lItem.href" target="_blank">{{lItem.name}}</a></li>
          </ul>
        </div>
      </div>
    </container>
  </div>
</template>
<script setup>
import {useHead} from "nuxt/app";
import {ref} from "vue";
import Container from "../components/common/Container";

useHead({
  bodyAttrs: {
    class: 'h-full bg-gray-100',
  },
});

const list = ref([]);
list.value = [
  {
    name: 'Favicon Icon, Blank Image Icon',
    license: 'Flaticon License',
    link: [
      {
        name: 'Book icons created by vectorsmarket15 - Flaticon',
        href: 'https://www.flaticon.com/premium-icon/books_2704442'
      },
      {
        name: 'Image icons created by Wahyu Adam - Flaticon',
        href: 'https://www.flaticon.com/premium-icon/images_4309076'
      }
    ]
  },
  {
    name: 'tailwindcss 3',
    license: 'MIT License',
    link: [
      {
        name: 'tailwindlabs/tailwindcss',
        href: 'https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE'
      },
      {
        name: 'tailwindlabs/headlessui',
        href: 'https://github.com/tailwindlabs/headlessui/blob/main/LICENSE'
      },
      {
        name: 'tailwindlabs/heroicons',
        href: 'https://github.com/tailwindlabs/heroicons/blob/master/LICENSE'
      }
    ]
  },
  {
    name: 'nuxt.js 3.0rc-1',
    license: 'MIT License',
    link: [
      {
        name: 'nuxt/framework',
        href: 'https://github.com/nuxt/framework/blob/main/LICENSE'
      }
    ]
  },
  {
    name: 'pinia 2.0',
    license: 'MIT License',
    link: [
      {
        name: 'vuejs/pinia',
        href: 'https://github.com/vuejs/pinia/blob/v2/LICENSE'
      }
    ]
  },
  {
    name: 'chart.js 3.7',
    license: 'MIT License',
    link: [
      {
        name: 'chartjs/Chart.js',
        href: 'https://github.com/chartjs/Chart.js/blob/master/LICENSE.md'
      }
    ]
  },
  {
    name: 'dayjs 1.11',
    license: 'MIT License',
    link: [
      {
        name: 'iamkun/dayjs',
        href: 'https://github.com/iamkun/dayjs/blob/dev/LICENSE'
      }
    ]
  },
  {
    name: 'lodash 4.17',
    license: 'MIT License',
    link: [
      {
        name: 'lodash/lodash',
        href: 'https://github.com/lodash/lodash/blob/master/LICENSE'
      }
    ]
  },
  {
    name: 'sass 1.50',
    license: 'MIT License',
    link: [
      {
        name: 'sass/sass',
        href: 'https://github.com/sass/sass/blob/main/LICENSE'
      }
    ]
  },
  {
    name: 'vue.js 3.2',
    license: 'MIT License',
    link: [
      {
        name: 'vuejs/core',
        href: 'https://github.com/vuejs/core/blob/main/LICENSE'
      }
    ]
  },
  {
    name: 'vue-datepicker 3.1',
    license: 'MIT License',
    link: [
      {
        name: 'vuepic/vue-datepicker',
        href: 'https://github.com/Vuepic/vue-datepicker/blob/main/LICENSE'
      }
    ]
  },
]
</script>
<style scoped>
a{
  @apply hover:text-blue-500;
}
.block {
  @apply bg-white px-4 py-5 border-b border-gray-200 sm:px-6;
}
.block + .block {
  @apply mt-3
}
</style>