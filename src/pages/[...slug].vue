<template>
  <nuxt-layout name="default">
    <div class="container mx-auto h-full">
    <div class="bg-white h-full grid content-center">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:text-center mb-10">
          <img src="~/assets/images/books.png" alt="" width="50" height="50" class="mx-auto" />
        </div>
        <div class="lg:text-center">
          <h2 class="text-base text-indigo-600 font-semibold tracking-wide uppercase">404 에러</h2>
          <p class="mt-2 text-xl leading-8 font-bold tracking-tight text-gray-900 sm:text-2xl">페이지를 찾을 수 없습니다.</p>
          <p class="mt-4 max-w-2xl text-gray-500 lg:mx-auto">주소를 다시 한번 확인해주세요</p>
          <nuxt-link to="/" class="mt-10 block w-full items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 fo cus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Home
          </nuxt-link>
        </div>
      </div>
    </div>
    </div>
  </nuxt-layout>
</template>