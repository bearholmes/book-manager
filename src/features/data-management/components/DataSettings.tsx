import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Input } from '@/shared/ui/Input';
import { SettingsSection } from '@/shared/ui/SettingsSection';
import { type DataManagementOptions, useDataManagement } from '../hooks/useDataManagement';
import { DataConfirmationDialog } from './DataConfirmationDialog';
import { PasswordField } from './PasswordField';

export function DataSettings(options: DataManagementOptions) {
  const controller = useDataManagement(options);
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    restorePassword,
    setRestorePassword,
    file,
    setFile,
    preview,
    setPreview,
    resetOpen,
    pending,
    error,
    message,
    exportBackup,
    inspectBackup,
    openReset,
  } = controller;
  return (
    <>
      <SettingsSection
        title="암호화 백업"
        description="도서 전체를 비밀번호로 보호한 .rdbackup 파일로 내보냅니다. 다른 컴퓨터에서도 복원할 수 있습니다. PIN과 기기 암호화 키는 백업에 포함하지 않습니다."
      >
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            void exportBackup();
          }}
        >
          <PasswordField
            id="backup-password"
            label="백업 비밀번호"
            value={password}
            onChange={setPassword}
          />
          <PasswordField
            id="backup-confirm"
            label="백업 비밀번호 확인"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
          <p className="text-xs text-copy-muted">
            12자 이상으로 설정하세요. 백업 비밀번호를 잊으면 복구할 수 없습니다.
          </p>
          <Button type="submit" disabled={pending}>
            암호화 백업 내보내기
          </Button>
        </form>
      </SettingsSection>
      <SettingsSection
        title="백업 복원"
        description="백업 내용을 확인한 뒤 기존 도서 전체를 덮어씁니다. 현재 PIN 설정은 유지합니다. 기존 도서를 보관하려면 먼저 백업하세요."
      >
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            void inspectBackup();
          }}
        >
          <Field htmlFor="backup-file" label="백업 파일">
            <Input
              id="backup-file"
              type="file"
              accept=".rdbackup"
              required
              disabled={pending}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setPreview(null);
              }}
            />
          </Field>
          <PasswordField
            id="restore-password"
            label="백업 파일 비밀번호"
            value={restorePassword}
            onChange={setRestorePassword}
          />
          <Button variant="secondary" type="submit" disabled={pending || !file}>
            백업 확인
          </Button>
        </form>
      </SettingsSection>
      <SettingsSection
        title="데이터 초기화"
        description="도서 전체와 PIN 설정을 삭제합니다. 내보낸 백업 파일은 삭제하지 않습니다."
        danger
      >
        <Button
          variant="danger"
          type="button"
          disabled={pending}
          onClick={() => {
            openReset();
          }}
        >
          데이터 초기화
        </Button>
      </SettingsSection>
      {!preview && !resetOpen && error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      )}
      {message && (
        <output className="mt-4 block break-all text-sm text-copy-secondary">{message}</output>
      )}
      {pending && <output className="mt-4 block text-sm text-copy-muted">처리 중…</output>}
      <DataConfirmationDialog controller={controller} lockEnabled={options.lockEnabled} />
    </>
  );
}
