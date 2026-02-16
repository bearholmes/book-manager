import { atom } from 'jotai';

/** Toast 항목 타입입니다. */
export interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

/** 전역 토스트 목록 상태입니다. */
export const toastsAtom = atom<Toast[]>([]);

/** 토스트를 추가하고 필요 시 자동으로 제거합니다. */
export const addToastAtom = atom(
  null,
  (get, set, toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const duration = toast.duration ?? 3000;

    const newToast: Toast = {
      id,
      type: 'info',
      ...toast,
      duration,
    };

    set(toastsAtom, [...get(toastsAtom), newToast]);

    // duration 이 0보다 크면 자동 제거 타이머를 등록합니다.
    if (duration > 0) {
      setTimeout(() => {
        set(toastsAtom, (prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  },
);

/** id로 토스트를 제거합니다. */
export const removeToastAtom = atom(null, (get, set, id: string) => {
  set(toastsAtom, get(toastsAtom).filter((t) => t.id !== id));
});
