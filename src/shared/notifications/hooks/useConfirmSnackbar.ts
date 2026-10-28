import { useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
import { addToastAtom, removeToastAtom } from '../store/toastStore';

/** A dismissed/unmounted question never counts as approval. */
export function useConfirmSnackbar() {
  const add = useSetAtom(addToastAtom);
  const remove = useSetAtom(removeToastAtom);
  const current = useRef<string | undefined>(undefined);
  const cancel = useCallback(() => {
    if (current.current) remove(current.current);
    current.current = undefined;
  }, [remove]);
  useEffect(() => cancel, [cancel]);
  const confirm = useCallback(
    (message: string, signal?: AbortSignal) => {
      cancel();
      if (signal?.aborted) return Promise.resolve(false);
      return new Promise<boolean>((resolve) => {
        const abort = () => remove(id);
        const finish = (accepted: boolean) => {
          signal?.removeEventListener('abort', abort);
          if (current.current === id) current.current = undefined;
          resolve(accepted);
        };
        const id = add({
          message,
          type: 'warning',
          duration: 0,
          actions: [
            { label: '취소', onClick: () => finish(false) },
            { label: '계속 입력', onClick: () => finish(true) },
          ],
          onDismiss: () => finish(false),
        });
        current.current = id;
        signal?.addEventListener('abort', abort, { once: true });
      });
    },
    [add, cancel, remove],
  );
  return { confirm, cancel };
}
