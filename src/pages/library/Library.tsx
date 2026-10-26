import { BookDetailModal, BookFilters, BookForm, VirtualizedBookGrid } from '@/features/books';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { PageContent } from '@/shared/ui/PageContent';
import { PageHeader } from '@/shared/ui/PageHeader';
import { SidePanel } from '@/shared/ui/SidePanel';
import { Spinner } from '@/shared/ui/Spinner';
import { LayoutGrid, List, Plus } from 'lucide-react';
import styles from './Library.module.css';
import { BookTable } from './components/BookTable';
import { useLibraryWorkspace } from './hooks/useLibraryWorkspace';

export function Library() {
  const {
    view,
    setView,
    filters,
    setFilters,
    sort,
    setSort,
    selectedBook,
    setSelectedBook,
    editingBook,
    setEditingBook,
    showAddPanel,
    setShowAddPanel,
    showDeleteModal,
    setShowDeleteModal,
    bookToDelete,
    isLoading,
    isError,
    error,
    refetch,
    books,
    hasNextPage,
    isFetchingNextPage,
    resultCount,
    totalBooksCount,
    topics,
    purchasePlaces,
    isCreating,
    isUpdating,
    isDeleting,
    topicColors,
    hasAnyBooks,
    handleAddBook,
    handleEditBook,
    handleDeleteClick,
    handleDeleteConfirm,
    isSearching,
    handleLoadMore,
  } = useLibraryWorkspace();
  const filtered = !!(
    filters.search ||
    filters.topic ||
    filters.purchase_place ||
    filters.condition
  );
  const emptyMessage = hasAnyBooks ? '검색 결과가 없습니다' : '등록된 도서가 없습니다';

  return (
    <PageContent>
      <PageHeader
        title="나의 서재"
        meta={filtered ? `${resultCount} / ${totalBooksCount ?? 0}권` : `${totalBooksCount ?? 0}권`}
        tools={
          <BookFilters
            filters={filters}
            onChange={setFilters}
            sort={sort}
            onSortChange={setSort}
            topics={topics}
            purchasePlaces={purchasePlaces}
            isSearching={isSearching}
          />
        }
        actions={
          <>
            <fieldset className={styles.views} aria-label="보기 방식">
              <Button
                variant="ghost"
                size="icon"
                className={styles.view}
                aria-label="목록 보기"
                aria-pressed={view === 'list'}
                onClick={() => setView('list')}
              >
                <List size={16} aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={styles.view}
                aria-label="표지 보기"
                aria-pressed={view === 'grid'}
                onClick={() => setView('grid')}
              >
                <LayoutGrid size={16} aria-hidden="true" />
              </Button>
            </fieldset>
            <Button type="button" onClick={() => setShowAddPanel(true)}>
              <Plus size={16} aria-hidden="true" />
              도서 추가
            </Button>
          </>
        }
      />
      {isLoading ? (
        <div className={styles.loading}>
          <Spinner />
        </div>
      ) : isError ? (
        <div role="alert" className={styles.empty}>
          <h2>서재를 불러오지 못했습니다</h2>
          <p>{error?.message}</p>
          <Button variant="secondary" onClick={() => void refetch()}>
            다시 시도
          </Button>
        </div>
      ) : (
        <>
          {view === 'list' ? (
            <BookTable books={books} onSelect={setSelectedBook} emptyMessage={emptyMessage} />
          ) : books.length > 0 ? (
            <VirtualizedBookGrid
              books={books}
              topicColors={topicColors}
              onBookClick={setSelectedBook}
            />
          ) : (
            <div className={styles.empty}>
              <output>{emptyMessage}</output>
            </div>
          )}
          {hasNextPage && (
            <div className="py-4 text-center">
              <Button variant="secondary" disabled={isFetchingNextPage} onClick={handleLoadMore}>
                {isFetchingNextPage ? '불러오는 중…' : '도서 더 불러오기'}
              </Button>
            </div>
          )}
        </>
      )}
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
          <p className="text-sm text-copy-secondary">
            정말로 <strong>{bookToDelete?.book_name}</strong>을(를) 삭제하시겠습니까?
            <br />이 작업은 되돌릴 수 없습니다.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="danger"
              type="button"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </div>
      </Modal>
    </PageContent>
  );
}
