import { useAtomValue } from 'jotai';
import { createPortal } from 'react-dom';
import { toastsAtom } from '@/shared/notifications/store/toastStore';
import { useOverlayHost } from '@/shared/ui/useOverlay';
import styles from './ToastContainer.module.css';
import { ToastItem } from './ToastItem';

/**
 * ToastContainer 컴포넌트를 렌더링합니다.
 */
export function ToastContainer() {
  const toasts = useAtomValue(toastsAtom);
  const host = useOverlayHost();

  if (toasts.length === 0 || !host) return null;

  return createPortal(
    <div className={styles.container}>
      <div
        className="mx-auto flex w-full max-w-md flex-col-reverse gap-2.5"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </div>,
    host,
  );
}
