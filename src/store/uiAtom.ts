import { atom } from 'jotai';

// Toast 타입
export interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

// Toast 리스트
export const toastsAtom = atom<Toast[]>([]);

// Toast 추가 액션
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

    // 자동 제거
    if (duration > 0) {
      setTimeout(() => {
        set(toastsAtom, (prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  },
);

// Toast 제거 액션
export const removeToastAtom = atom(null, (get, set, id: string) => {
  set(toastsAtom, get(toastsAtom).filter((t) => t.id !== id));
});

// Modal 상태
export interface ModalState {
  isOpen: boolean;
  type?: 'add' | 'edit' | 'delete' | 'detail';
  data?: unknown;
}

export const modalAtom = atom<ModalState>({
  isOpen: false,
});
