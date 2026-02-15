import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Upload, LogOut, Image as ImageIcon, House } from 'lucide-react';
import { useBooks } from '@/features/books/hooks/useBooks';
import { useCreateBook } from '@/features/books/hooks/useCreateBook';
import { useUpdateBook } from '@/features/books/hooks/useUpdateBook';
import { useDeleteBook } from '@/features/books/hooks/useDeleteBook';
import { useImageNullCount } from '@/features/books/hooks/useBookStats';
import { useImportBooks } from '@/features/books/hooks/useImportBooks';
import { useExportBooks } from '@/features/books/hooks/useExportBooks';
import { useSignout } from '@/features/auth/hooks/useSignout';
import { useTopicColors } from '@/hooks/useTopicColors';
import { useBookMetadata } from '@/hooks/useBookMetadata';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/common/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { SidePanel } from '@/components/ui/SidePanel';
import { Modal } from '@/components/ui/Modal';
import { FileUpload } from '@/components/ui/FileUpload';
import { BookFilters } from '@/components/book/BookFilters';
import { BookCard } from '@/components/book/BookCard';
import { BookDetailModal } from '@/components/book/BookDetailModal';
import { BookForm } from '@/components/book/BookForm';
import { StatisticsCharts } from '@/components/book/StatisticsCharts';
import { ROUTES } from '@/utils/constants';
import type { Book, BookFilters as BookFiltersType } from '@/types/book';
import type { BookFormData } from '@/utils/validation';

/**
 * 관리자 페이지
 * Vue 버전의 admin/index.vue 포팅
 */
export function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list');
  const [filters, setFilters] = useState<BookFiltersType>({});
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  const { data: books, isLoading } = useBooks({ filters });
  const { data: imageNullCount } = useImageNullCount();
  const { mutate: createBook, isPending: isCreating } = useCreateBook();
  const { mutate: updateBook, isPending: isUpdating } = useUpdateBook();
  const { mutate: deleteBook, isPending: isDeleting } = useDeleteBook();
  const { mutate: importBooks, isPending: isImporting } = useImportBooks();
  const { mutate: exportBooks, isPending: isExporting } = useExportBooks();
  const { mutate: signout } = useSignout();

  const topicColors = useTopicColors(books);
  const { topics, purchasePlaces } = useBookMetadata(books);

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
        title="도서 관리"
        subtitle="내 도서를 정리하고 통계를 확인하세요"
        actions={
          <>
            <button
              type="button"
              onClick={() => navigate(ROUTES.HOME)}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <House className="mr-2 h-4 w-4" />
              사용자 화면
            </button>
            <button
              type="button"
              onClick={() => signout()}
              className="inline-flex items-center rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </button>
          </>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Bar */}
        <div className="mb-6 flex items-center justify-between rounded-xl border border-primary-100/80 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-sm text-gray-500">{hasActiveFilters ? '조회 결과' : '전체 도서'}</span>
              <p className="text-2xl font-bold text-gray-900">{books?.length || 0}권</p>
            </div>
            {imageNullCount !== undefined && imageNullCount > 0 && (
              <div className="flex items-center gap-2 rounded-md bg-yellow-50 px-3 py-2">
                <ImageIcon className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  이미지 없음: {imageNullCount}권
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <FileUpload
              accept=".json"
              onFileSelect={handleImport}
              disabled={isImporting}
              className="text-sm"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? '임포트 중...' : 'JSON 임포트'}
            </FileUpload>
            <button
              type="button"
              onClick={() => exportBooks()}
              disabled={isExporting || !books || books.length === 0}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? '익스포트 중...' : 'JSON 익스포트'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddPanel(true)}
              className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              도서 추가
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as 'list' | 'stats')} />

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'list' ? (
            <div className="space-y-6">
              {/* Filters */}
              <BookFilters
                filters={filters}
                onChange={setFilters}
                topics={topics}
                purchasePlaces={purchasePlaces}
              />

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
                  <p className="text-gray-500">도서가 없습니다. 도서를 추가해주세요.</p>
                </div>
              )}
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
      <SidePanel
        isOpen={showAddPanel}
        onClose={() => setShowAddPanel(false)}
        title="도서 추가"
      >
        <BookForm
          onSubmit={handleAddBook}
          onCancel={() => setShowAddPanel(false)}
          isSubmitting={isCreating}
        />
      </SidePanel>

      {/* Edit Book Panel */}
      <SidePanel
        isOpen={!!editingBook}
        onClose={() => setEditingBook(null)}
        title="도서 수정"
      >
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
          <p className="text-sm text-gray-500">
            정말로 <strong>{bookToDelete?.book_name}</strong>을(를) 삭제하시겠습니까?
            <br />
            이 작업은 되돌릴 수 없습니다.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
