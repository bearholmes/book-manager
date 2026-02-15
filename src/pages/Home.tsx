import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { useBooks } from '@/features/books/hooks/useBooks';
import { useTopicColors } from '@/hooks/useTopicColors';
import { useBookMetadata } from '@/hooks/useBookMetadata';
import { userAtom } from '@/store/authAtom';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/common/PageHeader';
import { BookCard } from '@/components/book/BookCard';
import { BookDetailModal } from '@/components/book/BookDetailModal';
import { BookFilters } from '@/components/book/BookFilters';
import { ROUTES } from '@/utils/constants';
import type { Book, BookFilters as BookFiltersType } from '@/types/book';

/**
 * 홈 페이지 (사용자용)
 * Vue 버전의 index.vue 포팅
 */
export function Home() {
  const navigate = useNavigate();
  const user = useAtomValue(userAtom);
  const [filters, setFilters] = useState<BookFiltersType>({});
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const { data: books, isLoading } = useBooks({ filters });
  const topicColors = useTopicColors(books);
  const { topics, purchasePlaces } = useBookMetadata(books);
  const hasActiveFilters = !!(filters.search || filters.topic || filters.purchase_place);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app">
      <PageHeader
        title="방구석 도서관리 📚"
        subtitle="나만의 책장을 만들어보세요"
        actions={
          user ? (
            <button
              type="button"
              onClick={() => navigate(ROUTES.ADMIN)}
              className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
            >
              관리
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate(ROUTES.LOGIN)}
              className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
            >
              <LogIn className="mr-2 h-4 w-4" />
              로그인
            </button>
          )
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-6 rounded-xl border border-primary-100/80 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{hasActiveFilters ? '조회 결과' : '전체 도서'}</span>
            <p className="text-2xl font-bold text-gray-900">{books?.length || 0}권</p>
          </div>
        </div>

        {/* Filters */}
        {books && books.length > 0 && (
          <div className="mb-6">
            <BookFilters
              filters={filters}
              onChange={setFilters}
              topics={topics}
              purchasePlaces={purchasePlaces}
            />
          </div>
        )}

        {/* Book Grid */}
        {books && books.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                topicColor={book.topic ? topicColors[book.topic] : undefined}
                onClick={() => setSelectedBook(book)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-primary-100/70 bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">
              도서가 없습니다. 관리 페이지에서 도서를 추가해주세요.
            </p>
          </div>
        )}
      </div>

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          isOpen={!!selectedBook}
          onClose={() => setSelectedBook(null)}
          topicColor={selectedBook.topic ? topicColors[selectedBook.topic] : undefined}
        />
      )}
    </div>
  );
}
