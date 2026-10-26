import { clearBookQueries } from '@/features/books';
import { DataSettings } from '@/features/data-management';
import { PinSettings, useLock } from '@/features/lock';
import { clearLibraryPreferences } from '@/shared/lib/storage';
import { PageContent } from '@/shared/ui/PageContent';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useQueryClient } from '@tanstack/react-query';

export function Settings() {
  const { state, refresh } = useLock();
  const queryClient = useQueryClient();
  async function onDataChange() {
    await queryClient.cancelQueries();
    clearBookQueries(queryClient);
    clearLibraryPreferences();
    await refresh();
  }
  return (
    <PageContent className="mx-auto max-w-6xl">
      <PageHeader title="설정" />
      <PinSettings />
      <DataSettings lockEnabled={state.enabled} onDataChange={onDataChange} />
    </PageContent>
  );
}
