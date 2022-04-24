import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  ssr:false,
  debug: process.env.NODE_ENV !== 'production',
  eslint: {
    fix: true,
    cache: false,
  },
  srcDir: 'src/',

  baseURL: '/lunar-calc',
  buildDir: '/docs/',

  css: [
      '@vuepic/vue-datepicker/dist/main.css',
    '@/assets/css/main.css',
  ],
  buildModules: [
    [
      '@nuxtjs/eslint-module',
      {
        fix: true,
      },
    ],
      '@nuxtjs/tailwindcss',
  ],
  Modules: [
    '@vuepic/vue-datepicker',
      'dayjs',
      'lodash'
  ],

  app: {
    head: {
      title: '도서관리',
      htmlAttrs: {
        lang: 'ko',
        class: 'h-full'
      },
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  }
})
