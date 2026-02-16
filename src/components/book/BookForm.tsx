import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookSchema, type BookFormData } from '@/utils/validation';
import { BOOK_CONDITIONS, CURRENCIES } from '@/utils/constants';
import type { Book } from '@/types/book';

interface BookFormProps {
  book?: Book;
  onSubmit: (data: BookFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * 도서 추가/수정 폼 컴포넌트
 * Vue 버전의 NewItem/SidePopNew/SidePopEdit 포팅
 */
export function BookForm({ book, onSubmit, onCancel, isSubmitting }: BookFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookFormData>({
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
          purchase_date: book.purchase_date ?? '',
          purchase_place: book.purchase_place ?? '',
          topic: book.topic ?? '',
          image_url: book.image_url ?? '',
          duplicated: book.duplicated ?? false,
          comment: book.comment ?? '',
        }
      : {
          currency: 'KRW',
          duplicated: false,
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <section className="surface-muted space-y-4 p-4">
        <h3 className="text-base font-semibold text-primary-900">도서 기본 정보</h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="book_name"
              className="mb-1.5 block text-sm font-semibold text-primary-700"
            >
              도서명 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('book_name')}
              type="text"
              id="book_name"
              className="field-base"
              placeholder="도서명을 입력하세요"
            />
            {errors.book_name && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.book_name.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="isbn13"
                className="mb-1.5 block text-sm font-semibold text-primary-700"
              >
                ISBN-13
              </label>
              <input
                {...register('isbn13')}
                type="text"
                id="isbn13"
                className="field-base"
                placeholder="9788972214304"
              />
            </div>

            <div>
              <label
                htmlFor="author"
                className="mb-1.5 block text-sm font-semibold text-primary-700"
              >
                저자
              </label>
              <input {...register('author')} type="text" id="author" className="field-base" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="publisher"
                className="mb-1.5 block text-sm font-semibold text-primary-700"
              >
                출판사
              </label>
              <input {...register('publisher')} type="text" id="publisher" className="field-base" />
            </div>
            <div>
              <label
                htmlFor="topic"
                className="mb-1.5 block text-sm font-semibold text-primary-700"
              >
                주제
              </label>
              <input
                {...register('topic')}
                type="text"
                id="topic"
                className="field-base"
                placeholder="예: 프로그래밍, 소설, 역사"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="surface-muted space-y-4 p-4">
        <h3 className="text-base font-semibold text-primary-900">구매 정보</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="purchase_price"
              className="mb-1.5 block text-sm font-semibold text-primary-700"
            >
              구매 가격
            </label>
            <input
              {...register('purchase_price', { valueAsNumber: true })}
              type="number"
              id="purchase_price"
              min="0"
              step="0.01"
              className="field-base"
            />
          </div>

          <div>
            <label
              htmlFor="currency"
              className="mb-1.5 block text-sm font-semibold text-primary-700"
            >
              통화
            </label>
            <select {...register('currency')} id="currency" className="select-base">
              {CURRENCIES.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="purchase_date"
              className="mb-1.5 block text-sm font-semibold text-primary-700"
            >
              구매일
            </label>
            <input
              {...register('purchase_date')}
              type="date"
              id="purchase_date"
              className="field-base"
            />
          </div>

          <div>
            <label
              htmlFor="purchase_place"
              className="mb-1.5 block text-sm font-semibold text-primary-700"
            >
              구매처
            </label>
            <input
              {...register('purchase_place')}
              type="text"
              id="purchase_place"
              className="field-base"
              placeholder="예: 교보문고, 알라딘 등"
            />
          </div>
        </div>

        <div>
          <label htmlFor="condition" className="mb-1.5 block text-sm font-semibold text-primary-700">
            상태
          </label>
          <select {...register('condition')} id="condition" className="select-base">
            <option value="">선택안함</option>
            {BOOK_CONDITIONS.map((cond) => (
              <option key={cond} value={cond}>
                {cond}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="surface-muted space-y-4 p-4">
        <h3 className="text-base font-semibold text-primary-900">선택 항목</h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="image_url"
              className="mb-1.5 block text-sm font-semibold text-primary-700"
            >
              표지 이미지 URL
            </label>
            <input
              {...register('image_url')}
              type="url"
              id="image_url"
              className="field-base"
              placeholder="https://..."
            />
            {errors.image_url && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.image_url.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="duplicated"
              className="mb-1.5 block text-sm font-semibold text-primary-700"
            >
              중복 구매
            </label>
            <div className="field-base flex items-center gap-2">
              <input
                {...register('duplicated')}
                type="checkbox"
                id="duplicated"
                className="h-4 w-4 rounded border-primary-300 text-primary-700 focus:ring-primary-500"
              />
              <label htmlFor="duplicated" className="text-sm font-medium text-primary-800">
                이 도서를 중복 구매로 표시
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="mb-1.5 block text-sm font-semibold text-primary-700">
              메모
            </label>
            <textarea
              {...register('comment')}
              id="comment"
              rows={3}
              className="field-base"
              placeholder="자유롭게 메모를 작성하세요"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-2 border-t border-primary-100 pt-4">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="btn-ghost">
          취소
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? '저장 중...' : book ? '수정' : '추가'}
        </button>
      </div>
    </form>
  );
}
