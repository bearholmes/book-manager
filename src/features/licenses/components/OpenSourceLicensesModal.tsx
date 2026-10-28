import { lazy, Suspense } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Spinner } from '@/shared/ui/Spinner';
import type { LicenseGroup } from '../model/types';

const LicenseNotices = lazy(async () => {
  const url = new URL('licenses/open-source-notices.js', document.baseURI);
  url.searchParams.set('v', import.meta.url);
  const [view, data] = await Promise.all([
    import('./LicenseNotices'),
    import(/* @vite-ignore */ url.href) as Promise<{ default: LicenseGroup[] }>,
  ]);
  return { default: () => <view.default groups={data.default} /> };
});

export function OpenSourceLicensesModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="오픈소스 저작권 정보"
      size="2xl"
      centered
      scrollable
    >
      <Suspense fallback={<Spinner />}>
        <LicenseNotices />
      </Suspense>
    </Modal>
  );
}
