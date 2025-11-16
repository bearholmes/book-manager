import { useState } from 'react';
import { formatCurrency, formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { Book } from '@/types/book';

interface BookCardProps {
  book: Book;
  topicColor?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * 도서 카드 컴포넌트
 * Vue 버전의 BookItem 포팅
 */
export function BookCard({ book, topicColor, onClick, className }: BookCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      {/* 이미지 */}
      <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100">
        {book.image_url && !imageError ? (
          <img
            src={book.image_url}
            alt={book.book_name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <svg
              className="h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="p-4">
        {/* 도서명 */}
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
          {book.book_name}
        </h3>

        {/* 저자 */}
        {book.author && (
          <p className="mt-1 line-clamp-1 text-xs text-gray-600">{book.author}</p>
        )}

        {/* 주제 태그 */}
        {book.topic && (
          <div className="mt-2">
            <span
              className="inline-block rounded-full px-2 py-1 text-xs font-medium"
              style={{
                backgroundColor: topicColor || '#E5E7EB',
                color: '#1F2937',
              }}
            >
              {book.topic}
            </span>
          </div>
        )}

        {/* 구매 정보 */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          {book.purchase_price && (
            <span className="font-medium text-gray-900">
              {formatCurrency(book.purchase_price)}원
            </span>
          )}
          {book.purchase_date && (
            <span>{formatDate(book.purchase_date, 'yyyy.MM.dd')}</span>
          )}
        </div>

        {/* 중복 구매 표시 */}
        {book.duplicated && (
          <div className="mt-2">
            <span className="inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
              중복구매
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
