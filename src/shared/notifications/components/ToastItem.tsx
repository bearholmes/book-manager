import { type Toast, removeToastAtom } from '@/shared/notifications/store/toastStore';
import { useSetAtom } from 'jotai';
import { X } from 'lucide-react';
import styles from './ToastItem.module.css';

interface ToastItemProps {
  toast: Toast;
}

/**
 * ToastItem 컴포넌트를 렌더링합니다.
 */
export function ToastItem({ toast }: ToastItemProps) {
  const removeToast = useSetAtom(removeToastAtom);
  const toastType = toast.type || 'info';
  const isAssertive = toastType === 'error' || toastType === 'warning';

  return (
    <div
      className={styles.toast}
      role={isAssertive ? 'alert' : 'status'}
      aria-live={isAssertive ? 'assertive' : 'polite'}
    >
      <div className="flex items-center gap-2.5">
        <p className="min-w-0 flex-1 break-words text-sm font-medium leading-5 text-on-solid/95">
          {toast.message}
        </p>
        <button
          type="button"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-on-solid/65 transition-colors hover:bg-surface/10 hover:text-on-solid focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-0"
          onClick={() => removeToast(toast.id)}
        >
          <span className="sr-only">닫기</span>
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
