import {
  useBookStatsByPlace,
  useBookStatsByTopic,
  useBookTotalCount,
  useCreateBook,
  useDeleteBook,
  useInfiniteBooks,
  useTopicColors,
  useUpdateBook,
} from '@/features/books';
import type { BookFormData } from '@/features/books';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { Book, BookFilters as BookFiltersType, BookSort } from '@contracts/book';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useLibraryWorkspace() {
  const [view, setView] = useState<'list' | 'grid'>('list');
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
    isError,
    error,
    refetch,
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
  const { mutate: createBook, isPending: isCreating } = useCreateBook();
  const { mutate: updateBook, isPending: isUpdating } = useUpdateBook();
  const { mutate: deleteBook, isPending: isDeleting } = useDeleteBook();
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
    setSelectedBook(null);
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.metaKey && !event.ctrlKey) return;
      if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        if (selectedBook || editingBook || showAddPanel || showDeleteModal) return;
        setShowAddPanel(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedBook, editingBook, showAddPanel, showDeleteModal]);
  const isSearching = isFetching && !isFetchingNextPage;
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
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
  };
}
