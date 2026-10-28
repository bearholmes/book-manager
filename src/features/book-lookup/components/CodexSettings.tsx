import { desktop } from '@/shared/api/desktop';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Select } from '@/shared/ui/Input';
import { SettingsSection } from '@/shared/ui/SettingsSection';
import type { CodexAvailability, CodexSettings as Settings } from '@contracts/book-lookup';
import { useEffect, useRef, useState } from 'react';
import styles from './BookLookup.module.css';

export function CodexSettings() {
  const [settings, setSettings] = useState<Settings>();
  const [availability, setAvailability] = useState<CodexAvailability>();
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [saving, setSaving] = useState(false);
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
  const enabled = settings?.enabled;
  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    setAvailability(undefined);
    void desktop('codexAvailability', {})
      .then((value) => {
        if (stopped) return;
        setAvailability(value);
        setSettings((current) => {
          if (!current || !value.models.length) return current;
          const model = value.models.find((m) => m.id === current.model) ?? value.models[0];
          if (!model) return current;
          return {
            ...current,
            model: model.id,
            reasoningEffort: model.reasoningEfforts.includes(current.reasoningEffort)
              ? current.reasoningEffort
              : model.defaultReasoningEffort,
          };
        });
      })
      .catch((error) => {
        if (!stopped) setAvailability({ state: 'unavailable', models: [], message: error.message });
      });
    return () => {
      stopped = true;
    };
  }, [enabled]);
  const cancel = () => {
    generation.current++;
    if (active.current) void desktop('lookupCancel', { jobId: active.current }).catch(() => {});
    active.current = undefined;
    setPending(false);
  };
  async function toggle() {
    if (!settings) return;
    cancel();
    setSaving(true);
    setMessage('');
    try {
      setSettings(await desktop('codexSettingsSet', { ...settings, enabled: !settings.enabled }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '설정을 저장하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  }
  async function action(search: boolean) {
    if (!settings) return;
    const current = ++generation.current;
    setPending(true);
    setMessage('');
    try {
      await desktop('codexSettingsSet', settings);
      if (current !== generation.current) return;
      if (!search) {
        setMessage('설정을 저장했습니다.');
        return;
      }
      const status = await desktop('codexAvailability', {});
      if (current !== generation.current) return;
      setAvailability(status);
      if (status.state !== 'ready') return;
      await desktop('codexProbe', {});
      if (current !== generation.current) return;
      const { jobId } = await desktop('lookupStart', {
        isbn: '9788966260959',
        requestId: crypto.randomUUID(),
      });
      if (current !== generation.current) {
        await desktop('lookupCancel', { jobId });
        return;
      }
      active.current = jobId;
      setMessage('검색 연결을 확인하고 있습니다…');
      while (current === generation.current) {
        const job = await desktop('lookupStatus', { jobId });
        if (current !== generation.current) return;
        if (job.state === 'failed') throw new Error(job.message);
        if (job.state === 'succeeded') {
          setMessage(
            job.searched ? '정상 동작 중' : '응답은 받았지만 웹검색을 확인하지 못했습니다.',
          );
          return;
        }
        if (job.state === 'cancelled') return;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      if (current === generation.current)
        setMessage(error instanceof Error ? error.message : '연결할 수 없습니다.');
    } finally {
      if (current === generation.current) {
        if (active.current) void desktop('lookupCancel', { jobId: active.current }).catch(() => {});
        active.current = undefined;
        setPending(false);
      }
    }
  }
  const model = availability?.models.find((m) => m.id === settings?.model);
  return (
    <SettingsSection
      title="도서 조사 도우미"
      description="Codex로 도서 정보와 표지를 찾습니다."
      content={
        settings?.enabled || message ? (
          <div className={styles.settings}>
            {settings?.enabled && (
              <>
                <output>
                  {!availability
                    ? '설치 상태 확인 중…'
                    : availability.state === 'missing'
                      ? 'Codex 설치 안 됨'
                      : availability.state === 'unavailable'
                        ? 'Codex 연결 안 됨'
                        : 'Codex 설치됨'}
                </output>
                {availability?.message && <p role="alert">{availability.message}</p>}
                <div className={styles.settingsFields}>
                  <Field htmlFor="codex-model" label="AI 모델">
                    <Select
                      id="codex-model"
                      value={model?.id ?? ''}
                      disabled={pending || !availability?.models.length}
                      onChange={(e) => {
                        const next = availability?.models.find((m) => m.id === e.target.value);
                        if (next)
                          setSettings({
                            ...settings,
                            model: next.id,
                            reasoningEffort: next.defaultReasoningEffort,
                          });
                      }}
                    >
                      {!model && <option value="">모델 목록 없음</option>}
                      {availability?.models.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field htmlFor="codex-effort" label="추론 수준">
                    <Select
                      id="codex-effort"
                      value={settings.reasoningEffort}
                      disabled={pending || !model}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          reasoningEffort: e.target.value as Settings['reasoningEffort'],
                        })
                      }
                    >
                      {model?.reasoningEfforts.map((effort) => (
                        <option key={effort} value={effort}>
                          {effort}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <small>검색은 외부로 전송되며 Codex 사용량에 반영됩니다.</small>
                <div className={styles.actions}>
                  <Button disabled={pending || !model} onClick={() => void action(false)}>
                    설정 저장
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={pending || !availability}
                    onClick={() => void action(true)}
                  >
                    연결 확인
                  </Button>
                  {pending && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        cancel();
                        setMessage('연결 확인을 취소했습니다.');
                      }}
                    >
                      취소
                    </Button>
                  )}
                </div>
              </>
            )}
            {message && <output>{message}</output>}
          </div>
        ) : undefined
      }
    >
      <div className={styles.actions}>
        <button
          type="button"
          role="switch"
          aria-checked={!!enabled}
          aria-label="AI 도우미"
          disabled={!settings || saving}
          className={styles.switch}
          onClick={() => void toggle()}
        >
          <span />
        </button>
        <span>{enabled ? '켜짐' : '꺼짐'}</span>
      </div>
    </SettingsSection>
  );
}
