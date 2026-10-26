import { desktop } from '@/shared/api/desktop';
import type { BackupPreview } from '@contracts/desktop';
import { useState } from 'react';

export interface DataManagementOptions {
  lockEnabled: boolean;
  onDataChange: () => Promise<void>;
}

export function useDataManagement({ lockEnabled, onDataChange }: DataManagementOptions) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [restorePassword, setRestorePassword] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<BackupPreview | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [pin, setPin] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function run(operation: () => Promise<void>) {
    setPending(true);
    setError('');
    setMessage('');
    try {
      await operation();
    } catch (error) {
      setError(error instanceof Error ? error.message : '요청을 처리하지 못했습니다.');
    } finally {
      setPending(false);
    }
  }

  function closeDialog() {
    if (pending) return;
    setPreview(null);
    setResetOpen(false);
    setConfirmation('');
    setPin('');
    setError('');
  }

  async function finishDataChange() {
    await onDataChange();
    setPreview(null);
    setResetOpen(false);
    setConfirmation('');
    setPin('');
  }

  function exportBackup() {
    if (password !== confirmPassword) {
      setError('백업 비밀번호 확인을 일치시켜주세요.');
      return;
    }
    return run(async () => {
      const result = await desktop('backupExport', { password });
      setPassword('');
      setConfirmPassword('');
      if (result.path) setMessage(`${result.count}권을 백업했습니다. 저장 위치: ${result.path}`);
    });
  }

  function inspectBackup() {
    return run(async () => {
      if (!file || file.size > 32 * 1024 * 1024 || !file.name.toLowerCase().endsWith('.rdbackup'))
        throw new Error('32MB 이하 .rdbackup 파일을 선택해주세요.');
      const result = await desktop('backupInspect', {
        archive: await file.text(),
        password: restorePassword,
      });
      setRestorePassword('');
      setConfirmation('');
      setPin('');
      setPreview(result);
    });
  }

  function confirmDataChange() {
    return run(async () => {
      if (resetOpen) {
        await desktop('reset', {
          confirmation: '초기화',
          currentPin: lockEnabled ? pin : undefined,
        });
        await finishDataChange();
        setMessage('도서와 PIN 설정을 초기화했습니다.');
      } else if (preview) {
        const result = await desktop('backupRestore', {
          token: preview.token,
          confirmation: '복원',
          currentPin: lockEnabled ? pin : undefined,
        });
        await finishDataChange();
        setMessage(`${result.count}권으로 서재를 복원했습니다.`);
      }
    });
  }

  function openReset() {
    setError('');
    setMessage('');
    setConfirmation('');
    setPin('');
    setResetOpen(true);
  }

  return {
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
    confirmation,
    setConfirmation,
    pin,
    setPin,
    pending,
    error,
    message,
    closeDialog,
    exportBackup,
    inspectBackup,
    confirmDataChange,
    openReset,
  };
}

export type DataManagementController = ReturnType<typeof useDataManagement>;
