import { desktop } from '@/shared/api/desktop';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';
import { SettingsSection } from '@/shared/ui/SettingsSection';
import { useState } from 'react';
import { useLock } from './LockProvider';

export function PinSettings() {
  const { state, refresh } = useLock();
  const [action, setAction] = useState<'enable' | 'disable' | null>(null);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const enabling = action === 'enable';

  function clearForm() {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setError('');
    setAction(null);
  }

  function close() {
    if (!pending) clearForm();
  }

  async function save() {
    setError('');
    if (enabling && (newPin.length !== 4 || newPin !== confirmPin)) {
      setError('숫자 4자리 PIN을 동일하게 입력해주세요.');
      return;
    }
    setPending(true);
    try {
      await desktop('setPin', {
        currentPin: enabling ? undefined : currentPin,
        newPin: enabling ? newPin : null,
      });
      await refresh();
      clearForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'PIN을 저장하지 못했습니다.');
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <SettingsSection title="PIN 잠금" description="앱을 열 때 숫자 4자리 PIN으로 잠급니다.">
        <Button variant="secondary" onClick={() => setAction(state.enabled ? 'disable' : 'enable')}>
          {state.enabled ? '끄기' : '켜기'}
        </Button>
      </SettingsSection>
      <Modal
        isOpen={action !== null}
        onClose={close}
        title={enabling ? 'PIN 설정' : 'PIN 잠금 끄기'}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          {enabling ? (
            <>
              <PinField
                id="new-pin"
                label="PIN (숫자 4자리)"
                value={newPin}
                onChange={setNewPin}
                disabled={pending}
              />
              <PinField
                id="confirm-pin"
                label="PIN 확인"
                value={confirmPin}
                onChange={setConfirmPin}
                disabled={pending}
              />
            </>
          ) : (
            <PinField
              id="current-pin"
              label="현재 PIN"
              value={currentPin}
              onChange={setCurrentPin}
              disabled={pending}
            />
          )}
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" disabled={pending} onClick={close}>
              취소
            </Button>
            <Button
              type="submit"
              disabled={
                pending ||
                (enabling
                  ? newPin.length !== 4 || confirmPin.length !== 4
                  : currentPin.length !== 4)
              }
            >
              {pending ? '저장 중…' : enabling ? '켜기' : '끄기'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function PinField({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (pin: string) => void;
  disabled: boolean;
}) {
  return (
    <Field htmlFor={id} label={label}>
      <Input
        id={id}
        type="password"
        inputMode="numeric"
        maxLength={4}
        pattern="[0-9]{4}"
        required
        autoComplete="off"
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
      />
    </Field>
  );
}
