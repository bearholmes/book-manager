import { clearBookQueries } from '@/features/books';
import { DataSettings } from '@/features/data-management';
import { PinSettings, useLock } from '@/features/lock';
import { desktop } from '@/shared/api/desktop';
import { clearLibraryPreferences } from '@/shared/lib/storage';
import { Button } from '@/shared/ui/Button';
import { PageContent } from '@/shared/ui/PageContent';
import { PageHeader } from '@/shared/ui/PageHeader';
import { SettingsSection } from '@/shared/ui/SettingsSection';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function Settings() {
  const { state, refresh } = useLock();
  const queryClient = useQueryClient();
  const {
    data: info,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['desktop-info'],
    queryFn: () => desktop('info', {}),
  });
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
      <SettingsSection
        title="저장소"
        description="서재 데이터는 암호화되어 저장됩니다. 아래에서 백업 파일을 만들거나 복원할 수 있습니다."
      >
        <p className="break-all rounded-lg bg-surface-subtle p-3 text-sm">
          {info?.databasePath ??
            (isError ? '저장 위치를 확인하지 못했습니다.' : '저장 위치 확인 중…')}
        </p>
        {isError && (
          <div className="space-y-2">
            <p role="alert" className="text-sm text-danger">
              {info
                ? '저장 위치를 갱신하지 못했습니다. 이전 조회 결과를 표시합니다.'
                : '저장소 정보 조회에 실패했습니다.'}
            </p>
            <Button variant="secondary" disabled={isFetching} onClick={() => void refetch()}>
              다시 시도
            </Button>
          </div>
        )}
        <p className="text-xs text-copy-muted">방구석 도서관리 v{__APP_VERSION__}</p>
      </SettingsSection>
      <DataSettings lockEnabled={state.enabled} onDataChange={onDataChange} />
    </PageContent>
  );
}
