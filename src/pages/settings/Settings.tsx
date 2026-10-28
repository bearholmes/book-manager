import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { CodexSettings } from '@/features/book-lookup';
import { clearBookQueries } from '@/features/books';
import { DataSettings } from '@/features/data-management';
import { OpenSourceLicensesModal } from '@/features/licenses';
import { PinSettings, useLock } from '@/features/lock';
import { clearLibraryPreferences } from '@/shared/lib/storage';
import { type Theme, useTheme } from '@/shared/theme/theme';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Input';
import { PageContent } from '@/shared/ui/PageContent';
import { PageHeader } from '@/shared/ui/PageHeader';
import { SettingsSection } from '@/shared/ui/SettingsSection';
import styles from './Settings.module.css';

export function Settings() {
  const { state, refresh } = useLock();
  const { theme, setTheme } = useTheme();
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
      <SettingsSection title="테마" description="시스템을 선택하면 기기 설정을 따릅니다.">
        <Select
          aria-label="테마"
          value={theme}
          onChange={(event) => setTheme(event.target.value as Theme)}
        >
          <option value="system">시스템</option>
          <option value="dark">다크</option>
          <option value="light">라이트</option>
        </Select>
      </SettingsSection>
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
