import type { Book } from '@contracts/book';
import { formatDate } from '@/shared/lib/format';
import { Table } from '@/shared/ui/Table';
import styles from './BookTable.module.css';

export function BookTable({
  books,
  onSelect,
  emptyMessage = '등록된 도서가 없습니다',
}: {
  books: Book[];
  onSelect: (book: Book) => void;
  emptyMessage?: string;
}) {
  return (
    <div className={styles.wrapper}>
      <Table className={styles.table}>
        <colgroup>
          <col style={{ width: '36%' }} />
          <col style={{ width: '22%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '14%' }} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">도서</th>
            <th scope="col">저자 · 출판사</th>
            <th scope="col">주제</th>
            <th scope="col">구매처</th>
            <th scope="col">구매일</th>
          </tr>
        </thead>
        <tbody>
          {books.length === 0 && (
            <tr className={styles.empty}>
              <td colSpan={5}>
                <output>{emptyMessage}</output>
              </td>
            </tr>
          )}
          {books.map((book) => (
            <tr key={book.id}>
              <td>
                <button type="button" className={styles.title} onClick={() => onSelect(book)}>
                  {book.book_name}
                </button>
                {(book.isbn13 || book.duplicated) && (
                  <span className="mt-0.5 block text-xs text-copy-subtle">
                    {book.isbn13}
                    {book.duplicated ? ' · 중복 구매' : ''}
                  </span>
                )}
              </td>
              <td>
                <span className="block">{book.author || '—'}</span>
                <span className="text-xs text-copy-subtle">{book.publisher || '—'}</span>
              </td>
              <td>{book.topic || '미분류'}</td>
              <td>{book.purchase_place || '—'}</td>
              <td className="whitespace-nowrap">
                {book.purchase_date ? formatDate(book.purchase_date) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
