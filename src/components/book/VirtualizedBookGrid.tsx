import { useEffect, useMemo, useRef, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { BookCard } from '@/components/book/BookCard';
import { Spinner } from '@/components/ui/Spinner';
import type { Book } from '@/types/book';

interface VirtualizedBookGridProps {
  books: Book[];
  topicColors: Record<string, string>;
  onBookClick: (book: Book) => void;
  showPurchaseMeta?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

function getColumnCount(width: number) {
  if (width >= 1536) return 5;
  if (width >= 1280) return 4;
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

export function VirtualizedBookGrid({
  books,
  topicColors,
  onBookClick,
  showPurchaseMeta = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: VirtualizedBookGridProps) {
  const [columnCount, setColumnCount] = useState(() =>
    typeof window === 'undefined' ? 1 : getColumnCount(window.innerWidth),
  );
  const [scrollMargin, setScrollMargin] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setColumnCount(getColumnCount(window.innerWidth));
      if (containerRef.current) {
        const top = containerRef.current.getBoundingClientRect().top + window.scrollY;
        setScrollMargin(top);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const rowCount = Math.ceil(books.length / columnCount);
  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 430,
    overscan: 4,
    scrollMargin,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;
    const top = containerRef.current.getBoundingClientRect().top + window.scrollY;
    setScrollMargin(top);
  }, [books.length, columnCount]);

  const rows = useMemo(
    () =>
      virtualRows.map((virtualRow) => {
        const start = virtualRow.index * columnCount;
        const end = start + columnCount;
        return {
          key: virtualRow.key,
          index: virtualRow.index,
          start: virtualRow.start,
          books: books.slice(start, end),
        };
      }),
    [books, columnCount, virtualRows],
  );

  useEffect(() => {
    if (!onLoadMore || !hasNextPage || isFetchingNextPage || rowCount === 0) return;
    const lastVisibleRow = virtualRows[virtualRows.length - 1];
    if (lastVisibleRow && lastVisibleRow.index >= rowCount - 2) {
      onLoadMore();
    }
  }, [hasNextPage, isFetchingNextPage, onLoadMore, rowCount, virtualRows]);

  return (
    <div>
      <div ref={containerRef} className="relative" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {rows.map((row) => (
          <div
            key={row.key}
            data-index={row.index}
            ref={rowVirtualizer.measureElement}
            className="absolute left-0 top-0 grid w-full grid-cols-1 gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
            style={{ transform: `translateY(${row.start - scrollMargin}px)` }}
          >
            {row.books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                topicColor={book.topic ? topicColors[book.topic] : undefined}
                showPurchaseMeta={showPurchaseMeta}
                onClick={() => onBookClick(book)}
              />
            ))}
          </div>
        ))}
      </div>

      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-6">
          <Spinner size="sm" />
          <span className="ml-2 text-sm text-primary-600">도서를 더 불러오는 중...</span>
        </div>
      )}
    </div>
  );
}
