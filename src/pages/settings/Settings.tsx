import { CodexSettings } from '@/features/book-lookup';
import { clearBookQueries } from '@/features/books';
import { DataSettings } from '@/features/data-management';
import { OpenSourceLicensesModal } from '@/features/licenses';
import { PinSettings, useLock } from '@/features/lock';
import { clearLibraryPreferences } from '@/shared/lib/storage';
import { Button } from '@/shared/ui/Button';
import { PageContent } from '@/shared/ui/PageContent';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import styles from './Settings.module.css';

export function Settings() {
  const { state, refresh } = useLock();
  const queryClient = useQueryClient();
  const [showLicenses, setShowLicenses] = useState(false);
  async function onDataChange() {
    await queryClient.cancelQueries();
    clearBookQueries(queryClient);
    clearLibraryPreferences();
    await refresh();
  }
  return (
    <PageContent>
      <PageHeader title="설정" />
      <PinSettings />
      <CodexSettings />
      <DataSettings lockEnabled={state.enabled} onDataChange={onDataChange} />
      <footer className={styles.footer}>
        <Button
          variant="ghost"
          size="compact"
          className={styles.licenseLink}
          aria-haspopup="dialog"
          onClick={() => setShowLicenses(true)}
        >
          오픈소스 저작권 정보
        </Button>
      </footer>
      <OpenSourceLicensesModal isOpen={showLicenses} onClose={() => setShowLicenses(false)} />
    </PageContent>
  );
}
