import { useRef } from 'react';
import { Button } from '@/shared/ui/Button';
import { SettingsSection } from '@/shared/ui/SettingsSection';
import { type DataManagementOptions, useDataManagement } from '../hooks/useDataManagement';
import { DataConfirmationDialog } from './DataConfirmationDialog';
import { DataInputDialog } from './DataInputDialog';

export function DataSettings(options: DataManagementOptions) {
  const controller = useDataManagement(options);
  const fileInput = useRef<HTMLInputElement>(null);
  const {
    preview,
    resetOpen,
    inputDialog,
    pending,
    error,
    message,
    openExport,
    openRestore,
    openReset,
  } = controller;
  return (
    <>
      <SettingsSection
        title="백업"
        description="도서와 표지를 비밀번호로 보호한 파일로 저장합니다."
      >
        <Button variant="secondary" disabled={pending} onClick={openExport}>
          내보내기
        </Button>
      </SettingsSection>
      <SettingsSection title="복원" description="도서와 표지를 백업 내용으로 교체합니다.">
        <input
          ref={fileInput}
          type="file"
          accept=".rdbackup"
          aria-label="백업 파일"
          hidden
          disabled={pending}
          onChange={(event) => {
            const selectedFile = event.target.files?.[0];
            if (selectedFile) openRestore(selectedFile);
            event.target.value = '';
          }}
        />
        <Button variant="secondary" disabled={pending} onClick={() => fileInput.current?.click()}>
          파일 선택
        </Button>
      </SettingsSection>
      <SettingsSection
        title="데이터 초기화"
        description="도서·표지·PIN 설정을 모두 삭제합니다."
        danger
      >
        <Button variant="danger" disabled={pending} onClick={openReset}>
          초기화
        </Button>
      </SettingsSection>
      {!preview && !resetOpen && !inputDialog && error && (
        <p role="alert" className="mt-4 text-sm text-danger-text">
          {error}
        </p>
      )}
      {message && (
        <output className="mt-4 block break-all text-sm text-copy-secondary">{message}</output>
      )}
      <DataInputDialog controller={controller} />
      <DataConfirmationDialog controller={controller} lockEnabled={options.lockEnabled} />
    </>
  );
}
