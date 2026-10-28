import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import type { DataManagementController } from '../hooks/useDataManagement';
import { PasswordField } from './PasswordField';

export function DataInputDialog({ controller }: { controller: DataManagementController }) {
  const {
    inputDialog,
    closeDialog,
    pending,
    error,
    file,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    restorePassword,
    setRestorePassword,
    exportBackup,
    inspectBackup,
  } = controller;
  const exporting = inputDialog === 'export';
  return (
    <Modal
      isOpen={inputDialog !== null}
      onClose={closeDialog}
      title={exporting ? '백업 내보내기' : '복원'}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void (exporting ? exportBackup() : inspectBackup());
        }}
      >
        {exporting ? (
          <>
            <PasswordField
              id="backup-password"
              label="비밀번호 (12자 이상)"
              value={password}
              onChange={setPassword}
              disabled={pending}
            />
            <PasswordField
              id="backup-confirm"
              label="비밀번호 확인"
              value={confirmPassword}
              onChange={setConfirmPassword}
              disabled={pending}
            />
            <p className="text-xs text-copy-muted">비밀번호를 잊으면 복원할 수 없습니다.</p>
          </>
        ) : (
          <>
            <p className="break-all text-sm text-copy-secondary">{file?.name}</p>
            <PasswordField
              id="restore-password"
              label="백업 비밀번호"
              value={restorePassword}
              onChange={setRestorePassword}
              disabled={pending}
            />
          </>
        )}
        {error && (
          <p role="alert" className="text-sm text-danger-text">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" disabled={pending} onClick={closeDialog}>
            취소
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? '처리 중…' : exporting ? '내보내기' : '다음'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
