import type { Book } from '@contracts/book';
import type { BibliographicFields, BookHelperContext } from '@contracts/book-lookup';
import type { CoverUpload } from '@contracts/cover';
import { normalizeIsbn } from '@contracts/isbn';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { FieldGroup, Input, Select, Textarea } from '@/shared/ui/Input';
import { BOOK_CONDITIONS, CURRENCIES } from '../model/constants';
import { type BookFormData, type BookFormInput, bookSchema } from '../model/form-schema';
import styles from './BookForm.module.css';
import { CoverAttachment } from './CoverAttachment';

interface BookFormProps {
  book?: Book;
  onSubmit: (data: BookFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  renderIsbnHelper?: (context: BookHelperContext) => ReactNode;
  beforeSubmit?: (data: BookFormData) => Promise<boolean>;
}

/**
 * 도서 추가/수정 폼 컴포넌트
 */
export function BookForm({
  book,
  onSubmit,
  onCancel,
  isSubmitting,
  renderIsbnHelper,
  beforeSubmit,
}: BookFormProps) {
  const [cover, setCover] = useState<CoverUpload | null>();
  const [suggestedCover, setSuggestedCover] = useState<CoverUpload>();
  const [coverVersion, setCoverVersion] = useState(0);
  const coverRevision = useRef(0);
  const [checking, setChecking] = useState(false);
  const [processingCover, setProcessingCover] = useState(false);
  const {
    register,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<BookFormInput, undefined, BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: book
      ? {
          book_name: book.book_name,
          isbn13: book.isbn13 ?? '',
          author: book.author ?? '',
          publisher: book.publisher ?? '',
          publication_date: book.publication_date ?? '',
          condition: (book.condition as '신품' | '중고') ?? '',
          purchase_price: book.purchase_price ?? undefined,
          currency: book.currency ?? 'KRW',
          purchase_price_sec: book.purchase_price_sec ?? undefined,
          currency_sec: book.currency_sec ?? '',
          purchase_date: book.purchase_date ?? '',
          purchase_place: book.purchase_place ?? '',
          topic: book.topic ?? '',
          duplicated: book.duplicated ?? false,
          comment: book.comment ?? '',
        }
      : {
          currency: 'KRW',
          duplicated: false,
        },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (data) => {
        if (isSubmitting || processingCover || checking) return;
        const snapshot = JSON.stringify(getValues());
        const submittedCoverRevision = coverRevision.current;
        const submitted = { ...data, ...(cover !== undefined ? { cover } : {}) };
        setChecking(true);
        try {
          if (beforeSubmit && !(await beforeSubmit(submitted))) return;
          if (
            snapshot !== JSON.stringify(getValues()) ||
            submittedCoverRevision !== coverRevision.current
          )
            return;
          onSubmit(submitted);
        } finally {
          setChecking(false);
        }
      })}
      className={styles.form}
    >
      <fieldset className={styles.section}>
        <legend>도서 기본 정보</legend>
        <div className={styles.fields}>
          <Field
            htmlFor="book_name"
            label={
              <>
                도서명{' '}
                <span aria-hidden="true" className="text-danger-text">
                  *
                </span>
              </>
            }
            error={errors.book_name?.message}
          >
            <Input
              {...register('book_name')}
              id="book_name"
              required
              aria-invalid={!!errors.book_name}
              aria-describedby={errors.book_name ? 'book_name-error' : undefined}
              placeholder="도서명을 입력하세요"
            />
          </Field>
          <CoverAttachment
            coverId={book?.cover_id}
            suggestedCover={suggestedCover}
            hasLegacyUrl={!!book?.image_url}
            disabled={isSubmitting || checking}
            onChange={(value) => {
              coverRevision.current++;
              setCover(value);
              setCoverVersion((v) => v + 1);
            }}
            onProcessingChange={setProcessingCover}
          />
          <div className={styles.pair}>
            <Field htmlFor="isbn13" label="ISBN-13">
              <Input {...register('isbn13')} id="isbn13" placeholder="9788972214304" />
            </Field>
            <Field htmlFor="author" label="저자">
              <Input {...register('author')} id="author" />
            </Field>
          </div>
          {renderIsbnHelper?.({
            isbn: watch('isbn13') ?? '',
            bookId: book?.id,
            fields: {
              book_name: watch('book_name') ?? '',
              author: watch('author') ?? '',
              publisher: watch('publisher') ?? '',
              publication_date: watch('publication_date') ?? '',
            },
            coverVersion,
            hasCover: cover === undefined ? !!book?.cover_id || !!book?.image_url : cover !== null,
            apply: (patch, image) => {
              for (const [key, value] of Object.entries(patch))
                setValue(key as keyof BibliographicFields, value, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              const isbn = normalizeIsbn(getValues('isbn13') ?? '');
              if (isbn) setValue('isbn13', isbn, { shouldDirty: true });
              if (image) {
                coverRevision.current++;
                setCover(image);
                setSuggestedCover(image);
                setCoverVersion((v) => v + 1);
              }
            },
          })}
          <Field htmlFor="publication_date" label="출간일">
            <Input {...register('publication_date')} id="publication_date" type="date" />
            {errors.publication_date && <p role="alert">{errors.publication_date.message}</p>}
          </Field>
          <div className={styles.pair}>
            <Field htmlFor="publisher" label="출판사">
              <Input {...register('publisher')} id="publisher" />
            </Field>
            <Field htmlFor="topic" label="주제">
              <Input {...register('topic')} id="topic" placeholder="예: 프로그래밍, 소설, 역사" />
            </Field>
          </div>
        </div>
      </fieldset>
      <fieldset className={styles.section}>
        <legend>구매 정보</legend>
        <div className={styles.fields}>
          <div className={styles.pair}>
            <Field
              htmlFor="purchase_price"
              label="구매 가격"
              error={errors.purchase_price?.message}
            >
              <Input
                {...register('purchase_price', { valueAsNumber: true })}
                type="number"
                id="purchase_price"
                min="0"
                step="0.01"
                aria-invalid={!!errors.purchase_price}
                aria-describedby={errors.purchase_price ? 'purchase_price-error' : undefined}
              />
            </Field>
            <Field htmlFor="currency" label="통화">
              <Select {...register('currency')} id="currency">
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className={styles.pair}>
            <Field htmlFor="purchase_date" label="구매일" error={errors.purchase_date?.message}>
              <Input
                {...register('purchase_date')}
                type="date"
                id="purchase_date"
                aria-invalid={!!errors.purchase_date}
                aria-describedby={errors.purchase_date ? 'purchase_date-error' : undefined}
              />
            </Field>
            <Field htmlFor="purchase_place" label="구매처">
              <Input
                {...register('purchase_place')}
                id="purchase_place"
                placeholder="예: 교보문고, 알라딘 등"
              />
            </Field>
          </div>
          <Field htmlFor="condition" label="상태">
            <Select {...register('condition')} id="condition">
              <option value="">선택안함</option>
              {BOOK_CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </fieldset>
      <fieldset className={styles.section}>
        <legend>선택 항목</legend>
        <div className={styles.fields}>
          <FieldGroup className={styles.checkbox}>
            <input
              {...register('duplicated')}
              type="checkbox"
              id="duplicated"
              className="h-4 w-4 rounded border-line-hover text-action focus:ring-focus"
            />
            <label htmlFor="duplicated">이 도서를 중복 구매로 표시</label>
          </FieldGroup>
          <Field htmlFor="comment" label="메모">
            <Textarea
              {...register('comment')}
              id="comment"
              rows={3}
              placeholder="자유롭게 메모를 작성하세요"
            />
          </Field>
        </div>
      </fieldset>
      <div className={styles.actions}>
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isSubmitting}>
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting || processingCover || checking}>
          {isSubmitting ? '저장 중...' : book ? '수정' : '추가'}
        </Button>
      </div>
    </form>
  );
}
