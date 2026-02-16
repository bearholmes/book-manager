import { type Toast, removeToastAtom } from '@/store/uiAtom';
import { useSetAtom } from 'jotai';
import { X } from 'lucide-react';

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
      className="pointer-events-auto w-full rounded-xl bg-primary-900 px-4 py-3 text-white shadow-panel animate-in-up"
      role={isAssertive ? 'alert' : 'status'}
      aria-live={isAssertive ? 'assertive' : 'polite'}
    >
      <div className="flex items-center gap-2.5">
        <p className="min-w-0 flex-1 break-words text-sm font-medium leading-5 text-white/95">
          {toast.message}
        </p>
        <button
          type="button"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/65 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-0"
          onClick={() => removeToast(toast.id)}
        >
          <span className="sr-only">닫기</span>
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
