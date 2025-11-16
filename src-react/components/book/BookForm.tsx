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
          isbn13: book.isbn13 || '',
          author: book.author || '',
          publisher: book.publisher || '',
          publication_date: book.publication_date || '',
          condition: (book.condition as '신품' | '중고') || '',
          purchase_price: book.purchase_price || undefined,
          currency: book.currency || 'KRW',
          purchase_date: book.purchase_date || '',
          purchase_place: book.purchase_place || '',
          topic: book.topic || '',
          image_url: book.image_url || '',
          duplicated: book.duplicated || false,
          comment: book.comment || '',
        }
      : {
          currency: 'KRW',
          duplicated: false,
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 도서명 (필수) */}
      <div>
        <label htmlFor="book_name" className="block text-sm font-medium text-gray-700">
          도서명 <span className="text-red-500">*</span>
        </label>
        <input
          {...register('book_name')}
          type="text"
          id="book_name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          placeholder="도서명을 입력하세요"
        />
        {errors.book_name && (
          <p className="mt-1 text-sm text-red-600">{errors.book_name.message}</p>
        )}
      </div>

      {/* ISBN-13 */}
      <div>
        <label htmlFor="isbn13" className="block text-sm font-medium text-gray-700">
          ISBN-13
        </label>
        <input
          {...register('isbn13')}
          type="text"
          id="isbn13"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          placeholder="9788972214304"
        />
      </div>

      {/* 저자 */}
      <div>
        <label htmlFor="author" className="block text-sm font-medium text-gray-700">
          저자
        </label>
        <input
          {...register('author')}
          type="text"
          id="author"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
      </div>

      {/* 출판사 */}
      <div>
        <label htmlFor="publisher" className="block text-sm font-medium text-gray-700">
          출판사
        </label>
        <input
          {...register('publisher')}
          type="text"
          id="publisher"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
      </div>

      {/* 주제 */}
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
          주제
        </label>
        <input
          {...register('topic')}
          type="text"
          id="topic"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          placeholder="예: 양모펠트, 폼폼, 자수 등"
        />
      </div>

      {/* 상태 */}
      <div>
        <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
          상태
        </label>
        <select
          {...register('condition')}
          id="condition"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="">선택안함</option>
          {BOOK_CONDITIONS.map((cond) => (
            <option key={cond} value={cond}>
              {cond}
            </option>
          ))}
        </select>
      </div>

      {/* 구매 가격 & 통화 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700">
            구매 가격
          </label>
          <input
            {...register('purchase_price', { valueAsNumber: true })}
            type="number"
            id="purchase_price"
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
            통화
          </label>
          <select
            {...register('currency')}
            id="currency"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            {CURRENCIES.map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 구매일 */}
      <div>
        <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700">
          구매일
        </label>
        <input
          {...register('purchase_date')}
          type="date"
          id="purchase_date"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
      </div>

      {/* 구매처 */}
      <div>
        <label htmlFor="purchase_place" className="block text-sm font-medium text-gray-700">
          구매처
        </label>
        <input
          {...register('purchase_place')}
          type="text"
          id="purchase_place"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          placeholder="예: 교보문고, 알라딘 등"
        />
      </div>

      {/* 표지 이미지 URL */}
      <div>
        <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
          표지 이미지 URL
        </label>
        <input
          {...register('image_url')}
          type="url"
          id="image_url"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          placeholder="https://..."
        />
        {errors.image_url && (
          <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>
        )}
      </div>

      {/* 중복 구매 */}
      <div className="flex items-center">
        <input
          {...register('duplicated')}
          type="checkbox"
          id="duplicated"
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="duplicated" className="ml-2 block text-sm text-gray-900">
          중복 구매
        </label>
      </div>

      {/* 메모 */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          메모
        </label>
        <textarea
          {...register('comment')}
          id="comment"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          placeholder="자유롭게 메모를 작성하세요"
        />
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
        >
          {isSubmitting ? '저장 중...' : book ? '수정' : '추가'}
        </button>
      </div>
    </form>
  );
}
