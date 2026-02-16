import { useMemo, useState } from 'react';
import { LogIn, LogOut, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { useBooks } from '@/features/books/hooks/useBooks';
import { useSignout } from '@/features/auth/hooks/useSignout';
import { useTopicColors } from '@/hooks/useTopicColors';
import { useBookMetadata } from '@/hooks/useBookMetadata';
import { useDebounce } from '@/hooks/useDebounce';
import { userAtom } from '@/store/authAtom';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/common/PageHeader';
import { BookCard } from '@/components/book/BookCard';
import { BookDetailModal } from '@/components/book/BookDetailModal';
import { BookFilters } from '@/components/book/BookFilters';
import { ROUTES } from '@/utils/constants';
import type { Book, BookFilters as BookFiltersType, BookSort } from '@/types/book';

/**
 * 사용자 홈 페이지를 렌더링합니다.
 */
export function Home() {
  const navigate = useNavigate();
  const user = useAtomValue(userAtom);
  const { mutate: signout } = useSignout();
  const [filters, setFilters] = useState<BookFiltersType>({});
  const [sort, setSort] = useState<BookSort>({ field: 'created_at', order: 'desc' });
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const debouncedSearch = useDebounce(filters.search, 250);
  const queryFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [debouncedSearch, filters],
  );

  const { data: books, isLoading, isFetching } = useBooks({ filters: queryFilters, sort });
  const { data: allBooks } = useBooks();
  const topicColors = useTopicColors(books);
  const { topics, purchasePlaces } = useBookMetadata(allBooks);
  const hasActiveFilters = !!(filters.search || filters.topic || filters.purchase_place);
  const hasAnyBooks = (allBooks?.length ?? 0) > 0;
  const isSearching = !!filters.search && (filters.search !== debouncedSearch || isFetching);

  if (isLoading && !books) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app">
      <PageHeader
        title="나의 서재"
        subtitle="읽고 싶은 책과 읽은 책을 한 화면에서 관리하세요"
        actions={
          user ? (
            <>
              <button type="button" onClick={() => navigate(ROUTES.ADMIN)} className="btn-primary">
                <Settings2 className="h-4 w-4" />
                관리
              </button>
              <button type="button" onClick={() => signout()} className="btn-signout">
                <LogOut className="h-4 w-4" />
                로그아웃
              </button>
            </>
          ) : (
            <button type="button" onClick={() => navigate(ROUTES.LOGIN)} className="btn-primary">
              <LogIn className="h-4 w-4" />
              로그인
            </button>
          )
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {(isFetching || hasActiveFilters || (books?.length ?? 0) > 0) && (
          <div className="sticky top-3 z-20 mb-5">
            <BookFilters
              className="mb-0"
              filters={filters}
              onChange={setFilters}
              sort={sort}
              onSortChange={setSort}
              topics={topics}
              purchasePlaces={purchasePlaces}
              isSearching={isSearching}
              resultCount={books?.length ?? 0}
            />
          </div>
        )}

        {/* Book Grid */}
        {books && books.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                topicColor={book.topic ? topicColors[book.topic] : undefined}
                showPurchaseMeta={false}
                onClick={() => setSelectedBook(book)}
              />
            ))}
          </div>
        ) : hasAnyBooks && hasActiveFilters ? (
          <div className="rounded-xl border border-primary-200 bg-white px-5 py-6 text-center">
            <h2 className="text-lg font-semibold text-primary-900">검색 결과가 없습니다</h2>
            <p className="mt-1 text-sm text-primary-700">검색어 또는 필터 조건을 조정해보세요.</p>
            <button type="button" onClick={() => setFilters({})} className="btn-secondary mt-3 h-9">
              필터 초기화
            </button>
          </div>
        ) : !hasAnyBooks ? (
          <div className="surface-card p-12 text-center">
            <h2 className="text-xl font-semibold text-primary-900">아직 등록된 도서가 없습니다</h2>
            <p className="mt-2 text-sm text-primary-700">
              {user
                ? '관리 화면에서 도서를 추가하거나 임포트해보세요.'
                : '로그인 후 나만의 서재를 시작해보세요.'}
            </p>
            <button
              type="button"
              onClick={() => navigate(user ? ROUTES.ADMIN : ROUTES.LOGIN)}
              className="btn-primary mt-5"
            >
              {user ? '관리 화면으로 이동' : '로그인하러 가기'}
            </button>
          </div>
        ) : null}
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
