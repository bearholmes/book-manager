import { desktop } from '@/shared/api/desktop';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Input, Select } from '@/shared/ui/Input';
import { SettingsSection } from '@/shared/ui/SettingsSection';
import { REASONING_EFFORTS, type CodexSettings as Settings } from '@contracts/book-lookup';
import { useEffect, useRef, useState } from 'react';
import styles from './BookLookup.module.css';

export function CodexSettings() {
  const [settings, setSettings] = useState<Settings>();
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const active = useRef<string | undefined>(undefined);
  const generation = useRef(0);
  useEffect(() => {
    let stopped = false;
    void desktop('codexSettingsGet', {})
      .then((value) => {
        if (!stopped) setSettings(value);
      })
      .catch((error) => {
        if (!stopped) setMessage(error.message);
      });
    return () => {
      stopped = true;
      generation.current++;
      if (active.current) void desktop('lookupCancel', { jobId: active.current }).catch(() => {});
    };
  }, []);
  const cancel = () => {
    generation.current++;
    if (active.current) void desktop('lookupCancel', { jobId: active.current }).catch(() => {});
    active.current = undefined;
    setPending(false);
    setMessage('연결 테스트를 취소했습니다.');
  };
  async function action(kind: 'save' | 'probe' | 'search') {
    if (!settings) return;
    const current = ++generation.current;
    setPending(true);
    setMessage('');
    try {
      await desktop('codexSettingsSet', settings);
      if (current !== generation.current) return;
      if (kind === 'save') {
        setMessage('모델·추론 설정을 저장했습니다. 다음 조사부터 적용됩니다.');
        return;
      }
      const probe = await desktop('codexProbe', {});
      if (current !== generation.current) return;
      if (kind === 'probe') {
        setMessage(
          `Codex ${probe.version} 실행 확인. 로그인·웹검색은 검색 연결 테스트로 확인해주세요.`,
        );
        return;
      }
      const { jobId } = await desktop('lookupStart', {
        isbn: '9788966260959',
        requestId: crypto.randomUUID(),
      });
      if (current !== generation.current) {
        await desktop('lookupCancel', { jobId });
        return;
      }
      active.current = jobId;
      setMessage('공개 ISBN으로 검색 연결을 확인하고 있습니다…');
      while (current === generation.current) {
        const job = await desktop('lookupStatus', { jobId });
        if (current !== generation.current) return;
        if (job.state === 'failed') throw new Error(job.message);
        if (job.state === 'succeeded') {
          setMessage(
            job.searched
              ? '검색 연결을 확인했습니다.'
              : '응답은 받았지만 웹검색 실행은 확인하지 못했습니다.',
          );
          return;
        }
        if (job.state === 'cancelled') {
          setMessage('연결 테스트가 취소되었습니다.');
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      if (current === generation.current)
        setMessage(error instanceof Error ? error.message : '연결을 확인하지 못했습니다.');
    } finally {
      if (current === generation.current) {
        if (active.current) void desktop('lookupCancel', { jobId: active.current }).catch(() => {});
        active.current = undefined;
        setPending(false);
      }
    }
  }
  return (
    <SettingsSection
      title="도서 조사 도우미"
      description="Codex로 도서 정보와 표지를 찾습니다. 검색은 외부 서비스로 전송되며 Codex 사용량에 반영됩니다."
    >
      <div className={styles.settings}>
        {settings && (
          <>
            <Field htmlFor="codex-path" label="Codex 실행 파일">
              <Input
                id="codex-path"
                value={settings.executable}
                disabled={pending}
                onChange={(e) => setSettings({ ...settings, executable: e.target.value })}
              />
            </Field>
            <Field htmlFor="codex-model" label="AI 모델">
              <Input
                id="codex-model"
                list="codex-models"
                value={settings.model}
                disabled={pending}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              />
              <datalist id="codex-models">
                <option value="gpt-6.1-terra" />
                <option value="gpt-6.1-sol" />
                <option value="gpt-6-astra" />
              </datalist>
            </Field>
            <Field htmlFor="codex-effort" label="추론 수준">
              <Select
                id="codex-effort"
                value={settings.reasoningEffort}
                disabled={pending}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    reasoningEffort: e.target.value as Settings['reasoningEffort'],
                  })
                }
              >
                {REASONING_EFFORTS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </Select>
            </Field>
            <p>
              CLI에서 로그인한 계정을 사용합니다. 모델과 추론 수준의 지원 여부는 계정·CLI 버전에
              따라 다릅니다.
            </p>
            <div className={styles.actions}>
              <Button disabled={pending} onClick={() => void action('save')}>
                설정 저장
              </Button>
              <Button variant="secondary" disabled={pending} onClick={() => void action('probe')}>
                실행 확인
              </Button>
              <Button variant="ghost" disabled={pending} onClick={() => void action('search')}>
                검색 연결 테스트
              </Button>
              {pending && (
                <Button variant="ghost" onClick={cancel}>
                  테스트 취소
                </Button>
              )}
            </div>
          </>
        )}
        {message && <output>{message}</output>}
      </div>
    </SettingsSection>
  );
}
