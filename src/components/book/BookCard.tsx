import { useState, memo } from 'react';
import { formatCurrency, formatDate } from '@/utils/format';
import clsx from 'clsx';
import type { Book } from '@/types/book';

interface BookCardProps {
  /** 도서 정보 */
  book: Book;
  /** 주제 태그 배경색 */
  topicColor?: string;
  /** 카드 클릭 핸들러 */
  onClick?: () => void;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 도서 카드 컴포넌트
 *
 * 도서 정보를 카드 형태로 표시하는 컴포넌트입니다.
 * 키보드 네비게이션과 스크린 리더를 지원합니다.
 *
 * React.memo로 최적화되어 props가 변경될 때만 리렌더링됩니다.
 * 대량의 도서 목록을 렌더링할 때 성능 향상에 도움이 됩니다.
 *
 * @example
 * ```tsx
 * <BookCard
 *   book={book}
 *   topicColor="#E5E7EB"
 *   onClick={() => openDetailModal(book.id)}
 * />
 * ```
 */
export const BookCard = memo(function BookCard({ book, topicColor, onClick, className }: BookCardProps) {
  const [imageError, setImageError] = useState(false);

  // 키보드 이벤트 핸들러 (Enter/Space)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  // ARIA 레이블 생성
  const ariaLabel = `${book.book_name}${book.author ? `, 저자: ${book.author}` : ''}${
    book.topic ? `, 주제: ${book.topic}` : ''
  }${book.purchase_price ? `, 가격: ${formatCurrency(book.purchase_price)}원` : ''}`;

  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md',
        onClick && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        className,
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? ariaLabel : undefined}
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
});
