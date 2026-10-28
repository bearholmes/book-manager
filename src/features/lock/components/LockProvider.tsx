import { desktop } from '@/shared/api/desktop';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import type { LockState } from '@contracts/desktop';
import { useQueryClient } from '@tanstack/react-query';
import { LockKeyhole } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import styles from './LockProvider.module.css';

const LockContext = createContext<{
  state: LockState;
  lock: () => Promise<void>;
  refresh: () => Promise<void>;
} | null>(null);

export function useLock() {
  const context = useContext(LockContext);
  if (!context) throw new Error('LockProvider is required');
  return context;
}

export function LockProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<LockState | null>(null);
  const [error, setError] = useState('');
  const [pin, setPin] = useState('');
  const [pending, setPending] = useState(false);
  const refresh = useCallback(async () => {
    setState(await desktop('status', {}));
  }, []);
  useEffect(() => {
    refresh().catch((error) =>
      setError(
        error instanceof Error ? error.message : '저장소를 열 수 없습니다. 앱을 다시 실행해주세요.',
      ),
    );
  }, [refresh]);
  const lock = useCallback(async () => {
    const result = await desktop('lock', {});
    if (result.locked) {
      setState(result);
      await queryClient.cancelQueries();
      queryClient.clear();
    }
  }, [queryClient]);

  if (!state)
    return (
      <main className={styles.screen}>
        <h1>방구석 도서관리</h1>
        {error ? (
          <>
            <p role="alert">{error}</p>
            <Button
              type="button"
              onClick={() => {
                setError('');
                refresh().catch((error) =>
                  setError(
                    error instanceof Error
                      ? error.message
                      : '저장소를 열 수 없습니다. 앱을 다시 실행해주세요.',
                  ),
                );
              }}
            >
              다시 시도
            </Button>
          </>
        ) : (
          <output>서재를 여는 중…</output>
        )}
      </main>
    );

  return (
    <LockContext.Provider value={{ state, lock, refresh }}>
      {state.locked ? (
        <main className={styles.screen}>
          <LockKeyhole size={28} aria-hidden="true" />
          <h1>서재가 잠겨 있습니다</h1>
          <p>4자리 PIN으로 나의 서재를 열어주세요.</p>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setPending(true);
              setError('');
              try {
                setState(await desktop('unlock', { pin }));
                setPin('');
              } catch (error) {
                setError(error instanceof Error ? error.message : '잠금을 해제하지 못했습니다.');
                setPin('');
              } finally {
                setPending(false);
              }
            }}
            className="w-72 space-y-4"
          >
            <label htmlFor="unlock-pin" className="sr-only">
              4자리 PIN
            </label>
            <Input
              id="unlock-pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              required
              autoComplete="off"
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))}
              className={styles.pin}
            />
            {error && (
              <p role="alert" className="text-sm text-danger-text">
                {error}
              </p>
            )}
            <Button type="submit" disabled={pending || pin.length !== 4} className="w-full">
              {pending ? '확인 중…' : '잠금 해제'}
            </Button>
          </form>
          <p className="text-xs">데이터 파일은 암호화되어 저장됩니다. PIN은 앱 화면을 잠급니다.</p>
        </main>
      ) : (
        children
      )}
    </LockContext.Provider>
  );
}
