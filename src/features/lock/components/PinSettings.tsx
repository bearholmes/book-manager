import { desktop } from '@/shared/api/desktop';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Input } from '@/shared/ui/Input';
import { SettingsSection } from '@/shared/ui/SettingsSection';
import { useState } from 'react';
import { useLock } from './LockProvider';

export function PinSettings() {
  const { state, refresh } = useLock();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function save(disable = false) {
    setError('');
    setMessage('');
    if (!disable && (newPin.length !== 4 || newPin !== confirmPin)) {
      setError('새 PIN 4자리와 확인 입력을 일치시켜주세요.');
      return;
    }
    setPending(true);
    try {
      await desktop('setPin', {
        currentPin: state.enabled ? currentPin : undefined,
        newPin: disable ? null : newPin,
      });
      await refresh();
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setMessage(
        disable
          ? 'PIN 잠금을 해제했습니다.'
          : 'PIN을 저장했습니다. 다음 실행부터 잠금이 적용됩니다.',
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'PIN을 저장하지 못했습니다.');
    } finally {
      setPending(false);
    }
  }

  return (
    <SettingsSection
      title="PIN 잠금"
      description="원할 때 숫자 4자리 PIN을 설정하세요. 앱을 다시 열 때 잠기며, 사이드바에서도 바로 잠글 수 있습니다."
      meta={state.enabled ? '사용 중' : '사용 안 함'}
    >
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        {state.enabled && (
          <PinField id="current-pin" label="현재 PIN" value={currentPin} onChange={setCurrentPin} />
        )}
        <PinField
          id="new-pin"
          label={state.enabled ? '새 PIN' : 'PIN 설정'}
          value={newPin}
          onChange={setNewPin}
        />
        <PinField id="confirm-pin" label="PIN 확인" value={confirmPin} onChange={setConfirmPin} />
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        {message && <output className="block text-sm text-copy-secondary">{message}</output>}
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? '저장 중…' : state.enabled ? 'PIN 변경' : 'PIN 잠금 켜기'}
          </Button>
          {state.enabled && (
            <Button
              variant="secondary"
              type="button"
              disabled={pending || currentPin.length !== 4}
              onClick={() => void save(true)}
            >
              잠금 끄기
            </Button>
          )}
        </div>
      </form>
      <p className="text-xs text-copy-muted">
        PIN은 앱 화면 잠금용입니다. 데이터 파일은 PIN 사용 여부와 관계없이 암호화됩니다.
      </p>
    </SettingsSection>
  );
}

function PinField({
  id,
  label,
  value,
  onChange,
}: { id: string; label: string; value: string; onChange: (pin: string) => void }) {
  return (
    <Field htmlFor={id} label={label}>
      <Input
        id={id}
        type="password"
        inputMode="numeric"
        maxLength={4}
        pattern="[0-9]{4}"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
      />
    </Field>
  );
}
