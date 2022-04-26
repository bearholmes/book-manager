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

  // target: 'static',

//   router: { base: '/book-manager' },

  css: [
      '@vuepic/vue-datepicker/dist/main.css',
    '@/assets/css/main.css',
  ],
  buildModules: [
    // TODO
    // [
    //   '@nuxtjs/eslint-module',
    //   {
    //     fix: true,
    //   },
    // ],
      '@nuxtjs/tailwindcss',
  ],
  modules: [
  ],
  app: {
    head: {
      title: '방구석 도서관리',
      htmlAttrs: {
        lang: 'ko',
        class: 'h-full'
      },
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  }
})
