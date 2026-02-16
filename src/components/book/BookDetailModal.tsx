import { useMemo, useState } from 'react';
import {
  Calendar,
  DollarSign,
  MapPin,
  Package,
  Tag,
  User,
} from 'lucide-react';
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
 */
export function BookDetailModal({
  book,
  isOpen,
  onClose,
  topicColor,
  onEdit,
  onDelete,
}: BookDetailModalProps) {
  const [imageError, setImageError] = useState(false);

  if (!book) return null;

  const summaryItems = useMemo(
    () =>
      [
        book.author ? { label: '저자', value: book.author, icon: User } : null,
        book.publisher ? { label: '출판사', value: book.publisher, icon: Package } : null,
        book.topic
          ? {
              label: '주제',
              value: book.topic,
              icon: Tag,
              color: topicColor || '#d9e6f4',
            }
          : null,
      ].filter(Boolean) as Array<{
        label: string;
        value: string;
        icon: typeof User;
        color?: string;
      }>,
    [book.author, book.publisher, book.topic, topicColor],
  );

  const purchaseItems = useMemo(
    () =>
      [
        book.purchase_price !== null
          ? {
              label: '구매 가격',
              value: `${formatCurrency(book.purchase_price)} ${book.currency || 'KRW'}`,
              icon: DollarSign,
            }
          : null,
        book.purchase_date
          ? { label: '구매일', value: formatDate(book.purchase_date), icon: Calendar }
          : null,
        book.purchase_place ? { label: '구매처', value: book.purchase_place, icon: MapPin } : null,
        book.condition ? { label: '상태', value: book.condition, icon: Package } : null,
      ].filter(Boolean) as Array<{ label: string; value: string; icon: typeof Package }>,
    [book.condition, book.currency, book.purchase_date, book.purchase_place, book.purchase_price],
  );

  const extraItems = useMemo(
    () =>
      [
        book.isbn13 ? { label: 'ISBN-13', value: formatISBN(book.isbn13), mono: true } : null,
        book.publication_date
          ? { label: '출판일', value: formatDate(book.publication_date) }
          : null,
        book.comment ? { label: '메모', value: book.comment, multiline: true } : null,
      ].filter(Boolean) as Array<{
        label: string;
        value: string;
        mono?: boolean;
        multiline?: boolean;
      }>,
    [book.comment, book.isbn13, book.publication_date],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <div className="space-y-6 text-primary-900">
        {/* 이미지 및 기본 정보 */}
        <div className="flex flex-col gap-6 md:flex-row">
          {/* 표지 이미지 */}
          <div className="w-full md:w-56">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl border border-primary-100 bg-primary-50/70">
              {book.image_url && !imageError ? (
                <img
                  src={book.image_url}
                  alt={book.book_name}
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-primary-300">
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
              <h2 className="text-3xl font-semibold leading-tight text-primary-900">
                {book.book_name}
              </h2>
              {book.duplicated && (
                <span className="mt-3 inline-block rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
                  중복구매
                </span>
              )}
            </div>

            {summaryItems.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {summaryItems.map((item) => (
                  <div
                    key={`${item.label}-${item.value}`}
                    className="surface-muted flex items-start gap-2 p-3"
                  >
                    <item.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">
                        {item.label}
                      </p>
                      {item.label === '주제' ? (
                        <span
                          className="mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold"
                          style={{
                            backgroundColor: item.color,
                            color: '#172a3c',
                          }}
                        >
                          {item.value}
                        </span>
                      ) : (
                        <p className="mt-1 text-sm text-primary-900">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 구매 정보 */}
        <div className="border-t border-primary-100 pt-6">
          <h3 className="mb-4 text-xl font-semibold text-primary-900">구매 정보</h3>
          {purchaseItems.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {purchaseItems.map((item) => (
                <div
                  key={`${item.label}-${item.value}`}
                  className="surface-muted flex items-start gap-2 p-3"
                >
                  <item.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-500" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-primary-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-primary-600">등록된 구매 정보가 없습니다.</p>
          )}
        </div>

        {/* 추가 정보 */}
        {extraItems.length > 0 && (
          <div className="border-t border-primary-100 pt-6">
            <div className="space-y-3">
              {extraItems.map((item) => (
                <div key={`${item.label}-${item.value}`} className="surface-muted p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">
                    {item.label}
                  </p>
                  <p
                    className={`mt-1 text-sm text-primary-900 ${item.mono ? 'font-mono' : ''} ${item.multiline ? 'whitespace-pre-wrap' : ''}`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-primary-100 pt-4">
          <div className="flex gap-2">
            {onDelete && (
              <button type="button" onClick={() => onDelete(book)} className="btn-danger">
                삭제
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <button type="button" onClick={() => onEdit(book)} className="btn-primary">
                수정
              </button>
            )}
            <button type="button" onClick={onClose} className="btn-ghost">
              닫기
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
