import { SidePanel } from '@/shared/ui/SidePanel';
import { Spinner } from '@/shared/ui/Spinner';
import { Suspense, lazy } from 'react';

const OpenSourceNotices = lazy(() => import('./OpenSourceNotices'));

export function OpenSourcePanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <SidePanel isOpen={isOpen} onClose={onClose} title="오픈소스 저작권 정보">
      <Suspense fallback={<Spinner />}>
        <OpenSourceNotices />
      </Suspense>
    </SidePanel>
  );
}
