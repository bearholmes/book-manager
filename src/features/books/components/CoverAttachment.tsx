import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Surface } from '@/shared/ui/Surface';
import type { CoverUpload } from '@contracts/cover';
import { Image as ImageIcon, ImagePlus, Trash2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useCoverImage } from '../hooks/useCoverImage';
import { type OptimizedCover, optimizeCover } from '../model/optimizeCover';
import styles from './CoverAttachment.module.css';

interface CoverAttachmentProps {
  coverId?: string | null;
  hasLegacyUrl: boolean;
  disabled?: boolean;
  onChange: (cover: CoverUpload | null) => void;
  onProcessingChange: (processing: boolean) => void;
}

export function CoverAttachment({
  coverId,
  hasLegacyUrl,
  disabled,
  onChange,
  onProcessingChange,
}: CoverAttachmentProps) {
  const id = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const request = useRef(0);
  const [selection, setSelection] = useState<OptimizedCover | null>();
  const [preview, setPreview] = useState<{ blob: Blob; url: string }>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const stored = useCoverImage(selection === undefined ? coverId : null);
  useEffect(
    () => () => {
      request.current += 1;
    },
    [],
  );
  useEffect(() => {
    if (!selection) return;
    const url = URL.createObjectURL(selection.blob);
    setPreview({ blob: selection.blob, url });
    return () => URL.revokeObjectURL(url);
  }, [selection]);
  const src =
    selection === undefined ? stored : selection?.blob === preview?.blob ? preview?.url : undefined;
  const hasCover = selection === undefined ? !!coverId || hasLegacyUrl : !!selection;

  async function select(file: File) {
    const current = ++request.current;
    setPending(true);
    onProcessingChange(true);
    setError('');
    try {
      const optimized = await optimizeCover(file);
      if (request.current !== current) return;
      setSelection(optimized);
      onChange(optimized.upload);
    } catch (error) {
      if (request.current === current)
        setError(error instanceof Error ? error.message : '이미지를 처리하지 못했습니다.');
    } finally {
      if (request.current === current) {
        setPending(false);
        onProcessingChange(false);
      }
    }
  }

  return (
    <Field
      htmlFor={id}
      label="표지 이미지"
      error={error}
      description="JPG·PNG·WebP, 최대 20MB. 크기와 용량은 자동으로 줄입니다."
    >
      <Surface
        as="section"
        tone="muted"
        className={styles.attachment}
        aria-label="표지 이미지 첨부"
        aria-busy={pending}
      >
        <div className={styles.preview}>
          {src ? (
            <img src={src} alt="선택한 표지 미리보기" />
          ) : (
            <ImageIcon size={24} aria-hidden="true" />
          )}
        </div>
        <div className={styles.controls}>
          <p className={styles.status}>
            {pending
              ? '이미지 처리 중…'
              : hasCover
                ? '선택한 표지 이미지'
                : selection === null && (coverId || hasLegacyUrl)
                  ? '이미지 삭제 예정'
                  : '책 표지를 첨부하세요'}
          </p>
          <input
            ref={fileInput}
            id={id}
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled || pending}
            aria-invalid={!!error}
            aria-describedby={`${id}-description${error ? ` ${id}-error` : ''}`}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = '';
              if (file) void select(file);
            }}
          />
          <div className={styles.actions}>
            <Button
              variant="secondary"
              disabled={disabled || pending}
              aria-describedby={`${id}-description${error ? ` ${id}-error` : ''}`}
              onClick={() => fileInput.current?.click()}
            >
              <ImagePlus size={16} aria-hidden="true" />
              {hasCover ? '이미지 변경' : '이미지 첨부'}
            </Button>
            {hasCover && (
              <Button
                variant="danger"
                disabled={disabled || pending}
                onClick={() => {
                  setSelection(null);
                  setError('');
                  onChange(null);
                }}
              >
                <Trash2 size={16} aria-hidden="true" />
                이미지 삭제
              </Button>
            )}
          </div>
          {pending && <output>표지 최적화 중…</output>}
          {selection && (
            <output>
              {selection.width}×{selection.height}px · {Math.ceil(selection.blob.size / 1024)}KB
            </output>
          )}
          {selection === undefined && hasLegacyUrl && !coverId && (
            <p>기존 URL 표지는 이미지 파일을 다시 첨부해주세요.</p>
          )}
          {selection === null && (coverId || hasLegacyUrl) && <p>저장하면 이미지만 삭제됩니다.</p>}
        </div>
      </Surface>
    </Field>
  );
}
