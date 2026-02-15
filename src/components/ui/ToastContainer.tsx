import { toastsAtom } from '@/store/uiAtom';
import { useAtomValue } from 'jotai';
import { ToastItem } from './ToastItem';

export function ToastContainer() {
  const toasts = useAtomValue(toastsAtom);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-16 z-[60] px-4 sm:bottom-16">
      <div
        className="mx-auto flex w-full max-w-md flex-col-reverse gap-2.5"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  );
}
