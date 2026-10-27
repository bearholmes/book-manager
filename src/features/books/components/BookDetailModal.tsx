import { formatCurrency, formatDate, formatISBN } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import type { Book } from '@contracts/book';
import { BookOpen } from 'lucide-react';
import { useState } from 'react';
import { useCoverImage } from '../hooks/useCoverImage';
import styles from './BookDetailModal.module.css';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  topicColor?: string;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
}

function Details({ items }: { items: Array<[string, string | null | undefined]> }) {
  return (
    <dl className={styles.details}>
      {items
        .filter(([, value]) => value)
        .map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
    </dl>
  );
}

export function BookDetailModal({ book, isOpen, onClose, onEdit, onDelete }: BookDetailModalProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const coverUrl = useCoverImage(isOpen ? book?.cover_id : null);
  if (!book) return null;

  const purchaseItems: Array<[string, string | null | undefined]> = [
    [
      '구매 가격',
      book.purchase_price !== null
        ? `${formatCurrency(book.purchase_price)} ${book.currency || 'KRW'}`
        : null,
    ],
    ['구매일', book.purchase_date ? formatDate(book.purchase_date) : null],
    ['구매처', book.purchase_place],
    ['상태', book.condition],
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" title={book.book_name}>
      <div className={styles.content}>
        <div className={styles.overview}>
          <div className={styles.cover}>
            {coverUrl && coverUrl !== failedImageUrl ? (
              <img
                src={coverUrl}
                alt={book.book_name}
                onError={() => setFailedImageUrl(coverUrl)}
              />
            ) : (
              <BookOpen size={32} aria-label="표지 없음" />
            )}
          </div>
          <div className={styles.bibliography}>
            <Details
              items={[
                ['저자', book.author],
                ['출판사', book.publisher],
                ['주제', book.topic],
                ['ISBN-13', book.isbn13 ? formatISBN(book.isbn13) : null],
                ['출판일', book.publication_date ? formatDate(book.publication_date) : null],
              ]}
            />
            {book.duplicated && <span className={styles.duplicate}>중복구매</span>}
          </div>
        </div>
        <section className={styles.section} aria-label="구매 정보">
          <h3>구매 정보</h3>
          {purchaseItems.some(([, value]) => value) ? (
            <Details items={purchaseItems} />
          ) : (
            <p className={styles.muted}>등록된 구매 정보가 없습니다.</p>
          )}
        </section>
        {book.comment && (
          <section className={styles.section} aria-label="메모">
            <h3>메모</h3>
            <p className={styles.memo}>{book.comment}</p>
          </section>
        )}
        <div className={styles.actions}>
          {onDelete && (
            <Button variant="ghost" className={styles.delete} onClick={() => onDelete(book)}>
              삭제
            </Button>
          )}
          <div>
            <Button variant="secondary" onClick={onClose}>
              닫기
            </Button>
            {onEdit && <Button onClick={() => onEdit(book)}>수정</Button>}
          </div>
        </div>
      </div>
    </Modal>
  );
}
