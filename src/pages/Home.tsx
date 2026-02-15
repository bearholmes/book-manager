import { useMemo, useState } from 'react';
import { BookOpen, Filter, LogIn, LogOut, Settings2 } from 'lucide-react';
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
import type { Book, BookFilters as BookFiltersType } from '@/types/book';

/**
 * 홈 페이지 (사용자용)
 * Vue 버전의 index.vue 포팅
 */
export function Home() {
  const navigate = useNavigate();
  const user = useAtomValue(userAtom);
  const { mutate: signout } = useSignout();
  const [filters, setFilters] = useState<BookFiltersType>({});
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const debouncedSearch = useDebounce(filters.search, 250);
  const queryFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [debouncedSearch, filters],
  );

  const { data: books, isLoading, isFetching } = useBooks({ filters: queryFilters });
  const topicColors = useTopicColors(books);
  const { topics, purchasePlaces } = useBookMetadata(books);
  const hasActiveFilters = !!(filters.search || filters.topic || filters.purchase_place);
  const isSearching = !!filters.search && (filters.search !== debouncedSearch || isFetching);
  const activeFilterCount = [filters.search, filters.topic, filters.purchase_place].filter(
    Boolean,
  ).length;

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
        <div className="mb-6 grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <article className="kpi-card">
            <p className="text-sm font-semibold text-primary-600">
              {hasActiveFilters ? '조회 결과' : '전체 도서'}
            </p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <p className="font-serif text-4xl font-semibold text-primary-900">
                {books?.length || 0}
                <span className="ml-1 font-sans text-lg font-semibold text-primary-700">권</span>
              </p>
              {hasActiveFilters && (
                <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                  필터 {activeFilterCount}개
                </span>
              )}
            </div>
          </article>

          <article className="kpi-card">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary-600">활성 필터</p>
              <Filter className="h-4 w-4 text-primary-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-primary-900">{activeFilterCount}개</p>
          </article>

          <article className="kpi-card">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary-600">탐색 모드</p>
              <BookOpen className="h-4 w-4 text-primary-500" />
            </div>
            <p className="mt-2 text-xl font-semibold text-primary-900">
              {hasActiveFilters ? '맞춤 탐색' : '전체 탐색'}
            </p>
          </article>
        </div>

        {/* Filters */}
        {books && (books.length > 0 || hasActiveFilters) && (
          <BookFilters
            className="mb-6"
            filters={filters}
            onChange={setFilters}
            topics={topics}
            purchasePlaces={purchasePlaces}
            isSearching={isSearching}
            resultCount={books.length}
          />
        )}

        {/* Book Grid */}
        {books && books.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
