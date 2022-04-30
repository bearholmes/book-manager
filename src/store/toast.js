import { defineStore } from 'pinia';
import { getRandomId } from '@/utils/common';

// 팝업, 토스트
export const useStore = defineStore('TOAST', {
  state: () => ({
    // 토스트
    toast: {
      message: null,
      class: null,
      list: [],
      keys: [],
      listener: [],
    },
  }),
  getters: {
    /**
     * 토스트 가져오기
     * @param toast
     */
    GET_TOAST: ({ toast }) => toast.list,
  },
  actions: {
    /**
     * 모든 토스트 메시지 제거
     */
    STOP_TOAST() {
      this.toast.keys.forEach((item) => {
        clearTimeout(this.toast.listener[item]);
      });
      this.toast.list = [];
      this.toast.keys = [];
    },
    /**
     * 토스트 메시지 추가
     * @param payload
     */
    SET_TOAST_ITEM(payload) {
      this.toast.list.push(payload);
    },
    /**
     * 토스트 키 추가 (판별용)
     * @param payload
     */
    SET_TOAST_KEY(payload) {
      this.toast.keys.push(payload);
    },
    /**
     * 토스트 메시지 제거
     */
    REMOVE_TOAST_ITEM(key) {
      const listIdx = this.toast.list.findIndex((item) => item.key === key);
      const keyIdx = this.toast.keys.findIndex((item) => item === key);
      this.toast.list.splice(listIdx, 1);
      this.toast.keys.splice(keyIdx, 1);
    },
    /**
     * 토스트 메시지
     * @param payload
     * @return {Promise<void>}
     */
    async OPEN_TOAST(payload) {
      const key = getRandomId();
      const obj = {
        message: payload.msg,
        timer: payload.timer || null,
        class: payload.class || null,
        key: key,
      };

      this.SET_TOAST_ITEM(obj);
      this.SET_TOAST_KEY(key);

      if (payload.timer) {
        this.toast.listener[key] = setTimeout(() => {
          this.REMOVE_TOAST_ITEM(key);
        }, obj.timer);
      }
    },
  },
});
