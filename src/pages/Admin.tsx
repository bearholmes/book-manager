import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Upload, LogOut, Image as ImageIcon, House, Shield } from 'lucide-react';
import { useInfiniteBooks } from '@/features/books/hooks/useInfiniteBooks';
import { useCreateBook } from '@/features/books/hooks/useCreateBook';
import { useUpdateBook } from '@/features/books/hooks/useUpdateBook';
import { useDeleteBook } from '@/features/books/hooks/useDeleteBook';
import {
  useBookStatsByPlace,
  useBookStatsByTopic,
  useBookTotalCount,
  useImageNullCount,
} from '@/features/books/hooks/useBookStats';
import { useImportBooks } from '@/features/books/hooks/useImportBooks';
import { useExportBooks } from '@/features/books/hooks/useExportBooks';
import { useSignout } from '@/features/auth/hooks/useSignout';
import { useCurrentUserRole } from '@/features/auth/hooks/useCurrentUserRole';
import { useTopicColors } from '@/hooks/useTopicColors';
import { useDebounce } from '@/hooks/useDebounce';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/common/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { SidePanel } from '@/components/ui/SidePanel';
import { Modal } from '@/components/ui/Modal';
import { FileUpload } from '@/components/ui/FileUpload';
import { BookFilters } from '@/components/book/BookFilters';
import { BookDetailModal } from '@/components/book/BookDetailModal';
import { BookForm } from '@/components/book/BookForm';
import { StatisticsCharts } from '@/components/book/StatisticsCharts';
import { VirtualizedBookGrid } from '@/components/book/VirtualizedBookGrid';
import { ROUTES } from '@/utils/constants';
import type { Book, BookFilters as BookFiltersType, BookSort } from '@/types/book';
import type { BookFormData } from '@/utils/validation';

/**
 * 관리자 페이지를 렌더링합니다.
 */
export function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list');
  const [filters, setFilters] = useState<BookFiltersType>({});
  const [sort, setSort] = useState<BookSort>({ field: 'created_at', order: 'desc' });
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const debouncedSearch = useDebounce(filters.search, 250);
  const queryFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [debouncedSearch, filters],
  );

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteBooks({ filters: queryFilters, sort });
  const books = useMemo(() => data?.pages.flatMap((page) => page.books) || [], [data]);
  const resultCount = data?.pages[0]?.totalCount ?? books.length;
  const { data: totalBooksCount } = useBookTotalCount();
  const { data: topicStats } = useBookStatsByTopic();
  const { data: placeStats } = useBookStatsByPlace();
  const { data: imageNullCount } = useImageNullCount();
  const { mutate: createBook, isPending: isCreating } = useCreateBook();
  const { mutate: updateBook, isPending: isUpdating } = useUpdateBook();
  const { mutate: deleteBook, isPending: isDeleting } = useDeleteBook();
  const { mutate: importBooks, isPending: isImporting } = useImportBooks();
  const { mutate: exportBooks, isPending: isExporting } = useExportBooks();
  const { mutate: signout } = useSignout();
  const { data: role = 'user' } = useCurrentUserRole();

  const topicColors = useTopicColors(books);
  const topics = useMemo(
    () => topicStats?.filter((item) => item.topic !== '미분류').map((item) => item.topic) || [],
    [topicStats],
  );
  const purchasePlaces = useMemo(
    () =>
      placeStats
        ?.filter((item) => item.purchase_place !== '미분류')
        .map((item) => item.purchase_place) || [],
    [placeStats],
  );
  const hasAnyBooks = (totalBooksCount ?? 0) > 0;

  const handleAddBook = (data: BookFormData) => {
    createBook(data, {
      onSuccess: () => {
        setShowAddPanel(false);
      },
    });
  };

  const handleEditBook = (data: BookFormData) => {
    if (!editingBook) return;
    updateBook(
      { id: editingBook.id, ...data },
      {
        onSuccess: () => {
          setEditingBook(null);
        },
      },
    );
  };

  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (!bookToDelete) return;
    deleteBook(bookToDelete.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        setBookToDelete(null);
        setSelectedBook(null);
      },
    });
  };

  const handleImport = (file: File) => {
    importBooks(file);
  };

  const tabs = [
    { id: 'list', name: '목록' },
    { id: 'stats', name: '통계' },
  ];

  const hasActiveFilters = !!(filters.search || filters.topic || filters.purchase_place);
  const isSearching =
    !!filters.search && (filters.search !== debouncedSearch || (isFetching && !isFetchingNextPage));
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading && books.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app">
      <PageHeader
        title="도서 관리"
        subtitle="도서 데이터 품질과 컬렉션 현황을 함께 관리하세요"
        actions={
          <>
            <button type="button" onClick={() => navigate(ROUTES.HOME)} className="btn-secondary">
              <House className="h-4 w-4" />
              사용자 화면
            </button>
            {role === 'super_admin' && (
              <button
                type="button"
                onClick={() => navigate(ROUTES.OPS)}
                className="btn-secondary"
              >
                <Shield className="h-4 w-4" />
                운영 콘솔
              </button>
            )}
            <button type="button" onClick={() => signout()} className="btn-signout">
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <article className="kpi-card">
            <p className="text-sm font-semibold text-primary-600">
              {hasActiveFilters ? '조회 결과' : '전체 도서'}
            </p>
            <div className="mt-2">
              <p className="font-serif text-4xl font-semibold text-primary-900">
                {resultCount}
                <span className="ml-1 font-sans text-lg font-semibold text-primary-700">권</span>
              </p>
            </div>
          </article>

          <article className="kpi-card">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary-600">이미지 누락</p>
              <ImageIcon className="h-4 w-4 text-accent-600" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-primary-900">{imageNullCount ?? 0}권</p>
          </article>
        </div>

        <div className="mb-6 surface-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setShowAddPanel(true)} className="btn-primary">
              <Plus className="h-4 w-4" />
              도서 추가
            </button>

            <FileUpload
              accept=".json"
              onFileSelect={handleImport}
              disabled={isImporting}
              className="w-full sm:w-auto"
            >
              <Upload className="h-4 w-4" />
              {isImporting ? '임포트 중...' : 'JSON 임포트'}
            </FileUpload>

            <button
              type="button"
              onClick={() => exportBooks()}
              disabled={isExporting || resultCount === 0}
              className="btn-secondary w-full sm:w-auto"
            >
              <Download className="h-4 w-4" />
              {isExporting ? '익스포트 중...' : 'JSON 익스포트'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as 'list' | 'stats')}
          className="max-w-sm"
        />

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'list' ? (
            <div className="space-y-6">
              {/* Filters */}
              <div className="sticky top-3 z-20">
                <BookFilters
                  filters={filters}
                  onChange={setFilters}
                  sort={sort}
                  onSortChange={setSort}
                  topics={topics}
                  purchasePlaces={purchasePlaces}
                  isSearching={isSearching}
                  resultCount={resultCount}
                />
              </div>

              {/* Book Grid */}
              {books.length > 0 ? (
                <VirtualizedBookGrid
                  books={books}
                  topicColors={topicColors}
                  showPurchaseMeta={false}
                  onBookClick={setSelectedBook}
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  onLoadMore={handleLoadMore}
                />
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
                  <h2 className="text-xl font-semibold text-primary-900">관리할 도서가 없습니다</h2>
                  <p className="mt-2 text-sm text-primary-700">
                    새 도서를 추가하거나 JSON 파일을 임포트해 컬렉션을 채워보세요.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPanel(true)}
                      className="btn-primary"
                    >
                      <Plus className="h-4 w-4" />
                      도서 추가
                    </button>
                    <FileUpload
                      accept=".json"
                      onFileSelect={handleImport}
                      disabled={isImporting}
                      className="w-full sm:w-auto"
                    >
                      <Upload className="h-4 w-4" />
                      JSON 임포트
                    </FileUpload>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <StatisticsCharts />
          )}
        </div>
      </div>

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          isOpen={!!selectedBook}
          onClose={() => setSelectedBook(null)}
          topicColor={selectedBook.topic ? topicColors[selectedBook.topic] : undefined}
          onEdit={(book) => {
            setEditingBook(book);
            setSelectedBook(null);
          }}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Add Book Panel */}
      <SidePanel isOpen={showAddPanel} onClose={() => setShowAddPanel(false)} title="도서 추가">
        <BookForm
          onSubmit={handleAddBook}
          onCancel={() => setShowAddPanel(false)}
          isSubmitting={isCreating}
        />
      </SidePanel>

      {/* Edit Book Panel */}
      <SidePanel isOpen={!!editingBook} onClose={() => setEditingBook(null)} title="도서 수정">
        {editingBook && (
          <BookForm
            book={editingBook}
            onSubmit={handleEditBook}
            onCancel={() => setEditingBook(null)}
            isSubmitting={isUpdating}
          />
        )}
      </SidePanel>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="도서 삭제"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-primary-700">
            정말로 <strong>{bookToDelete?.book_name}</strong>을(를) 삭제하시겠습니까?
            <br />이 작업은 되돌릴 수 없습니다.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="btn-ghost"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="btn-danger"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
