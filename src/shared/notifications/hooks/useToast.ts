import { type Toast, addToastAtom, removeToastAtom } from '@/shared/notifications/store/toastStore';
import { useSetAtom } from 'jotai';

/**
 * Toast 알림을 관리하는 훅
 */
export function useToast() {
  const addToast = useSetAtom(addToastAtom);
  const removeToast = useSetAtom(removeToastAtom);

  const success = (message: string, duration?: number) => {
    addToast({ message, type: 'success', duration });
  };

  const error = (message: string, duration?: number) => {
    addToast({ message, type: 'error', duration });
  };

  const info = (message: string, duration?: number) => {
    addToast({ message, type: 'info', duration });
  };

  const warning = (message: string, duration?: number) => {
    addToast({ message, type: 'warning', duration });
  };

  const custom = (toast: Omit<Toast, 'id'>) => {
    addToast(toast);
  };

  const dismiss = (id: string) => {
    removeToast(id);
  };

  return {
    success,
    error,
    info,
    warning,
    custom,
    dismiss,
  };
}
