import type { BookHelperContext, LookupJob } from '@contracts/book-lookup';
import { normalizeIsbn } from '@contracts/isbn';
import { useEffect, useRef, useState } from 'react';
import { desktop } from '@/shared/api/desktop';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Input';
import styles from './BookLookup.module.css';
import { BookSuggestion } from './BookSuggestion';

export function BookLookup({
  context,
  beforeLookup,
}: {
  context: BookHelperContext;
  beforeLookup: (isbn: string, signal: AbortSignal) => Promise<boolean>;
}) {
  const [job, setJob] = useState<LookupJob>();
  const [jobId, setJobId] = useState('');
  const [candidate, setCandidate] = useState(0);
  const [message, setMessage] = useState('');
  const [starting, setStarting] = useState(false);
  const request = useRef(0);
  const active = useRef<string | undefined>(undefined);
  const confirmation = useRef<AbortController | undefined>(undefined);
  const cancel = () => {
    request.current++;
    confirmation.current?.abort();
    if (active.current) void desktop('lookupCancel', { jobId: active.current }).catch(() => {});
    active.current = undefined;
    setJob(undefined);
    setStarting(false);
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: ISBN changes invalidate the entire lookup session.
  useEffect(() => {
    setJob(undefined);
    setMessage('');
    setStarting(false);
    return () => {
      request.current++;
      confirmation.current?.abort();
      if (active.current) void desktop('lookupCancel', { jobId: active.current }).catch(() => {});
      active.current = undefined;
    };
  }, [context.isbn]);
  useEffect(() => {
    if (!jobId) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const state = await desktop('lookupStatus', { jobId });
        if (stopped || active.current !== jobId) return;
        setJob(state);
        if (state.state === 'running') timer = setTimeout(() => void poll(), 1000);
      } catch (error) {
        if (!stopped)
          setJob({
            state: 'failed',
            message: error instanceof Error ? error.message : '조사 상태를 확인하지 못했습니다.',
          });
      }
    };
    void poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [jobId]);
  async function start() {
    const isbn = normalizeIsbn(context.isbn);
    if (!isbn) {
      setMessage('유효한 ISBN 10자리 또는 13자리를 입력해주세요.');
      return;
    }
    cancel();
    const current = ++request.current;
    const controller = new AbortController();
    confirmation.current = controller;
    setStarting(true);
    setMessage('');
    try {
      if (!(await beforeLookup(isbn, controller.signal)) || current !== request.current) return;
      const result = await desktop('lookupStart', { isbn, requestId: crypto.randomUUID() });
      if (current !== request.current) {
        await desktop('lookupCancel', result);
        return;
      }
      active.current = result.jobId;
      setJobId(result.jobId);
      setJob({ state: 'running' });
      setCandidate(0);
    } catch (error) {
      if (current === request.current)
        setMessage(error instanceof Error ? error.message : '조사를 시작하지 못했습니다.');
    } finally {
      if (current === request.current) setStarting(false);
    }
  }
  const selected = job?.state === 'succeeded' ? job.result.candidates[candidate] : undefined;
  return (
    <section className={styles.helper} aria-label="도서 조사 도우미">
      <div className={styles.actions}>
        <Button
          variant="secondary"
          disabled={starting || job?.state === 'running'}
          onClick={() => void start()}
        >
          정보 찾기
        </Button>
        {(starting || job?.state === 'running') && (
          <>
            <output>도서 정보를 찾고 있습니다…</output>
            <Button variant="ghost" onClick={cancel}>
              조사 취소
            </Button>
          </>
        )}
      </div>
      {message && <output>{message}</output>}
      {job?.state === 'failed' && (
        <p role="alert" className={styles.error}>
          {job.message}
        </p>
      )}
      {job?.state === 'succeeded' && (
        <>
          <output>
            {job.result.candidates.length
              ? '이런 도서 정보를 찾았습니다. 맞는 내용을 선택해주세요.'
              : '도서 정보를 찾지 못했습니다.'}
          </output>
          {!job.searched && <p>웹검색 실행을 확인하지 못했습니다. 출처를 확인해주세요.</p>}
          {job.result.candidates.length > 1 && (
            <label htmlFor="lookup-candidate">
              도서 후보
              <Select
                id="lookup-candidate"
                value={candidate}
                onChange={(e) => setCandidate(Number(e.target.value))}
              >
                {job.result.candidates.map((c, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: A completed result has a fixed candidate order, including potentially identical titles.
                  <option key={`${i}-${c.title}`} value={i}>
                    {c.title} · {c.publisher}
                  </option>
                ))}
              </Select>
            </label>
          )}
          {selected && (
            <BookSuggestion
              key={`${jobId}-${candidate}`}
              candidate={selected}
              candidateIndex={candidate}
              jobId={jobId}
              context={context}
              onApplied={() => {
                cancel();
                setMessage('폼에 반영했습니다. 필요한 내용을 수정한 뒤 저장해주세요.');
              }}
            />
          )}
          <Button variant="ghost" size="compact" onClick={cancel}>
            추천 닫기
          </Button>
        </>
      )}
    </section>
  );
}
