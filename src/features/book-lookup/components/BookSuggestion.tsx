import type {
  BibliographicFields,
  BookHelperContext,
  LookupCandidate,
} from '@contracts/book-lookup';
import type { CoverUpload } from '@contracts/cover';
import { normalizeIsbn } from '@contracts/isbn';
import { useEffect, useRef, useState } from 'react';
import { desktop } from '@/shared/api/desktop';
import { optimizeCover } from '@/shared/lib/optimizeCover';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Input';
import styles from './BookLookup.module.css';

const labels = {
  book_name: '도서명',
  author: '저자',
  publisher: '출판사',
  publication_date: '출간일',
};
export function BookSuggestion({
  candidate,
  candidateIndex,
  jobId,
  context,
  onApplied,
}: {
  candidate: LookupCandidate;
  candidateIndex: number;
  jobId: string;
  context: BookHelperContext;
  onApplied: () => void;
}) {
  const values: BibliographicFields = {
    book_name: candidate.title,
    author: candidate.author ?? '',
    publisher: candidate.publisher ?? '',
    publication_date: candidate.publicationDate ?? '',
  };
  const mismatched =
    !!candidate.reportedIsbn &&
    normalizeIsbn(candidate.reportedIsbn) !== normalizeIsbn(context.isbn);
  const [selected, setSelected] = useState<Partial<Record<keyof BibliographicFields, boolean>>>(
    () =>
      Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          key,
          !mismatched && !!value && !context.fields[key as keyof BibliographicFields],
        ]),
      ),
  );
  const previous = useRef(context.fields);
  const previousCover = useRef(context.coverVersion);
  const [coverIndex, setCoverIndex] = useState(0);
  const [cover, setCover] = useState<{ upload: CoverUpload; url: string }>();
  const [useCover, setUseCover] = useState(false);
  const [coverError, setCoverError] = useState('');
  const [coverPending, setCoverPending] = useState(false);
  const [retry, setRetry] = useState(0);
  const latest = useRef(context);
  latest.current = context;
  useEffect(() => {
    const changed = (Object.keys(labels) as (keyof BibliographicFields)[]).filter(
      (k) => previous.current[k] !== context.fields[k],
    );
    if (changed.length)
      setSelected((v) => ({ ...v, ...Object.fromEntries(changed.map((k) => [k, false])) }));
    previous.current = context.fields;
    if (previousCover.current !== context.coverVersion) setUseCover(false);
    previousCover.current = context.coverVersion;
  }, [context.fields, context.coverVersion]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: retry intentionally starts a fresh transfer.
  useEffect(() => {
    const initialCoverVersion = latest.current.coverVersion;
    let stopped = false;
    let transferId: string | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let url: string | undefined;
    setCover(undefined);
    setUseCover(false);
    setCoverError('');
    if (!candidate.covers[coverIndex]) return;
    setCoverPending(true);
    const poll = async () => {
      if (!transferId || stopped) return;
      try {
        const state = await desktop('lookupCoverStatus', { transferId });
        if (stopped) return;
        if (state.state === 'running') {
          timer = setTimeout(() => void poll(), 500);
          return;
        }
        if (state.state === 'failed') throw new Error(state.message);
        if (state.state !== 'succeeded') {
          setCoverPending(false);
          return;
        }
        const bytes = Uint8Array.from(atob(state.data), (c) => c.charCodeAt(0));
        const optimized = await optimizeCover(new File([bytes], 'cover', { type: state.mimeType }));
        if (stopped) return;
        url = URL.createObjectURL(optimized.blob);
        setCover({ upload: optimized.upload, url });
        setCoverPending(false);
        setUseCover(
          !latest.current.hasCover &&
            latest.current.coverVersion === initialCoverVersion &&
            !mismatched,
        );
      } catch (error) {
        if (!stopped) {
          setCoverError(error instanceof Error ? error.message : '표지를 가져오지 못했습니다.');
          setCoverPending(false);
        }
      }
    };
    void desktop('lookupCoverStart', { jobId, candidateIndex, coverIndex })
      .then((result) => {
        transferId = result.transferId;
        if (stopped) {
          void desktop('lookupCoverCancel', { transferId }).catch(() => {});
          return;
        }
        void poll();
      })
      .catch((error) => {
        if (!stopped) {
          setCoverError(error.message);
          setCoverPending(false);
        }
      });
    return () => {
      stopped = true;
      clearTimeout(timer);
      if (url) URL.revokeObjectURL(url);
      if (transferId) void desktop('lookupCoverCancel', { transferId }).catch(() => {});
    };
  }, [jobId, candidateIndex, coverIndex, candidate.covers, mismatched, retry]);
  const open = (url: string) =>
    void desktop('openLookupSource', { jobId, url }).catch((error) => setCoverError(error.message));
  return (
    <div className={styles.result}>
      {mismatched && (
        <p className={styles.error}>
          요청한 ISBN과 후보의 ISBN이 다릅니다: {candidate.reportedIsbn}. 반영할 항목을 직접
          선택해주세요.
        </p>
      )}
      {candidate.covers.length > 1 && (
        <label htmlFor="lookup-cover">
          표지 후보
          <Select
            id="lookup-cover"
            value={coverIndex}
            onChange={(e) => setCoverIndex(Number(e.target.value))}
          >
            {candidate.covers.map((c, i) => (
              <option key={c.imageUrl} value={i}>
                표지 {i + 1}
              </option>
            ))}
          </Select>
        </label>
      )}
      {coverPending && <output>표지를 가져오는 중…</output>}
      {cover && (
        <label className={styles.cover}>
          <input
            type="checkbox"
            checked={useCover}
            onChange={(e) => setUseCover(e.target.checked)}
          />
          <img src={cover.url} alt="조사한 표지 후보" />
          <span>
            표지 반영
            {context.hasCover && <small className={styles.previous}>현재 표지를 교체합니다.</small>}
          </span>
        </label>
      )}
      {candidate.covers[coverIndex] && (
        <Button
          variant="ghost"
          size="compact"
          onClick={() => open(candidate.covers[coverIndex]?.sourcePageUrl ?? '')}
        >
          표지 출처
        </Button>
      )}
      {coverError && (
        <div>
          <p role="alert" className={styles.error}>
            {coverError}
          </p>
          <Button variant="ghost" size="compact" onClick={() => setRetry((v) => v + 1)}>
            표지 다시 가져오기
          </Button>
        </div>
      )}
      {(Object.keys(labels) as (keyof BibliographicFields)[]).map((key) => (
        <label key={key} className={styles.field}>
          <input
            type="checkbox"
            checked={!!selected[key]}
            disabled={!values[key] || values[key] === context.fields[key]}
            onChange={(e) => setSelected((v) => ({ ...v, [key]: e.target.checked }))}
          />
          <span>
            <span className={styles.label}>{labels[key]}</span>
            {values[key] || '찾지 못함'}
            {context.fields[key] && (
              <small className={styles.previous}>
                {values[key] === context.fields[key]
                  ? '현재 값과 같음'
                  : `현재: ${context.fields[key]}`}
              </small>
            )}
          </span>
        </label>
      ))}
      <div className={styles.actions}>
        {candidate.sources.map((source) => (
          <Button key={source.url} variant="ghost" size="compact" onClick={() => open(source.url)}>
            {source.label || '출처 보기'}
          </Button>
        ))}
      </div>
      {!candidate.sources.length && <p>출처 링크가 제공되지 않았습니다.</p>}
      {!!candidate.notes.length && (
        <ul className={styles.notes}>
          {candidate.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
      <Button
        variant="secondary"
        disabled={!Object.values(selected).some(Boolean) && !(useCover && cover)}
        onClick={() => {
          const patch = Object.fromEntries(
            Object.entries(values).filter(
              ([key]) =>
                selected[key as keyof BibliographicFields] &&
                previous.current[key as keyof BibliographicFields] ===
                  latest.current.fields[key as keyof BibliographicFields],
            ),
          );
          context.apply(
            patch,
            useCover && previousCover.current === context.coverVersion ? cover?.upload : undefined,
          );
          onApplied();
        }}
      >
        폼에 반영
      </Button>
    </div>
  );
}
