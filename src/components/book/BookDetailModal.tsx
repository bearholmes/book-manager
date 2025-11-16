import { useState } from 'react';
import { Calendar, DollarSign, MapPin, Package, Tag, User } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate, formatISBN } from '@/utils/format';
import type { Book } from '@/types/book';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  topicColor?: string;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
}

/**
 * 도서 상세 모달 컴포넌트
 * Vue 버전의 ContentModal 포팅
 */
export function BookDetailModal({ book, isOpen, onClose, topicColor, onEdit, onDelete }: BookDetailModalProps) {
  const [imageError, setImageError] = useState(false);

  if (!book) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <div className="space-y-6">
        {/* 이미지 및 기본 정보 */}
        <div className="flex flex-col gap-6 sm:flex-row">
          {/* 표지 이미지 */}
          <div className="w-full sm:w-48">
            <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100">
              {book.image_url && !imageError ? (
                <img
                  src={book.image_url}
                  alt={book.book_name}
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <svg className="h-20 w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </div>

          {/* 기본 정보 */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{book.book_name}</h2>
              {book.duplicated && (
                <span className="mt-2 inline-block rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                  중복구매
                </span>
              )}
            </div>

            {book.author && (
              <div className="flex items-start gap-2">
                <User className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">저자</p>
                  <p className="mt-1 text-sm text-gray-900">{book.author}</p>
                </div>
              </div>
            )}

            {book.publisher && (
              <div className="flex items-start gap-2">
                <Package className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">출판사</p>
                  <p className="mt-1 text-sm text-gray-900">{book.publisher}</p>
                </div>
              </div>
            )}

            {book.topic && (
              <div className="flex items-start gap-2">
                <Tag className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">주제</p>
                  <span
                    className="mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium"
                    style={{
                      backgroundColor: topicColor || '#E5E7EB',
                      color: '#1F2937',
                    }}
                  >
                    {book.topic}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 구매 정보 */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">구매 정보</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {book.purchase_price && (
              <div className="flex items-start gap-2">
                <DollarSign className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">구매 가격</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {formatCurrency(book.purchase_price)} {book.currency || 'KRW'}
                  </p>
                </div>
              </div>
            )}

            {book.purchase_date && (
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">구매일</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(book.purchase_date)}</p>
                </div>
              </div>
            )}

            {book.purchase_place && (
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">구매처</p>
                  <p className="mt-1 text-sm text-gray-900">{book.purchase_place}</p>
                </div>
              </div>
            )}

            {book.condition && (
              <div className="flex items-start gap-2">
                <Package className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">상태</p>
                  <p className="mt-1 text-sm text-gray-900">{book.condition}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 추가 정보 */}
        {(book.isbn13 || book.publication_date || book.comment) && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">추가 정보</h3>
            <div className="space-y-3">
              {book.isbn13 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">ISBN-13</p>
                  <p className="mt-1 font-mono text-sm text-gray-900">{formatISBN(book.isbn13)}</p>
                </div>
              )}

              {book.publication_date && (
                <div>
                  <p className="text-sm font-medium text-gray-500">출판일</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(book.publication_date)}</p>
                </div>
              )}

              {book.comment && (
                <div>
                  <p className="text-sm font-medium text-gray-500">메모</p>
                  <p className="mt-1 text-sm text-gray-900">{book.comment}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex justify-between border-t border-gray-200 pt-4">
          <div className="flex gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(book)}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
              >
                삭제
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(book)}
                className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
              >
                수정
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
