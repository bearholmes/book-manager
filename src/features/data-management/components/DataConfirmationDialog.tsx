import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';
import type { DataManagementController } from '../hooks/useDataManagement';

export function DataConfirmationDialog({
  controller,
  lockEnabled,
}: { controller: DataManagementController; lockEnabled: boolean }) {
  const {
    preview,
    resetOpen,
    pending,
    closeDialog,
    confirmDataChange,
    pin,
    setPin,
    confirmation,
    setConfirmation,
    error,
  } = controller;
  return (
    <Modal
      isOpen={!!preview || resetOpen}
      onClose={closeDialog}
      title={resetOpen ? '데이터 초기화 확인' : '백업 덮어쓰기 확인'}
      size="md"
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void confirmDataChange();
        }}
      >
        {preview && (
          <div className="space-y-2 text-sm">
            <p>
              현재 도서 <strong>{preview.currentCount}권</strong> → 백업 도서{' '}
              <strong>{preview.count}권</strong>
            </p>
            <p>백업 시각: {new Date(preview.createdAt).toLocaleString()}</p>
            <p>기존 도서를 전부 교체합니다. 현재 PIN은 유지합니다.</p>
          </div>
        )}
        {resetOpen && (
          <p className="text-sm">
            도서 전체와 PIN 설정을 삭제합니다. 이 작업은 되돌릴 수 없습니다. 외부 백업 파일은
            남겨둡니다.
          </p>
        )}
        {lockEnabled && (
          <div>
            <label htmlFor="data-current-pin" className="mb-1.5 block text-sm font-semibold">
              현재 PIN 확인
            </label>
            <Input
              id="data-current-pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              required
              autoComplete="off"
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))}
            />
          </div>
        )}
        <div>
          <label htmlFor="data-confirm" className="mb-1.5 block text-sm font-semibold">
            확인 문구: {resetOpen ? '초기화' : '복원'}
          </label>
          <Input
            id="data-confirm"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" disabled={pending} onClick={closeDialog}>
            취소
          </Button>
          <Button
            variant="danger"
            type="submit"
            disabled={
              pending ||
              confirmation !== (resetOpen ? '초기화' : '복원') ||
              (lockEnabled && pin.length !== 4)
            }
          >
            {resetOpen ? '초기화 실행' : '전체 덮어쓰기 복원'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
