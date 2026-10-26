import { Spinner } from '@/shared/ui/Spinner';
import type { Book } from '@contracts/book';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BookCard } from './BookCard';

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
  if (width >= 1500) return 5;
  if (width >= 1200) return 4;
  if (width >= 850) return 3;
  if (width >= 520) return 2;
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
      setColumnCount(getColumnCount(containerRef.current?.clientWidth ?? window.innerWidth));
      if (containerRef.current) {
        const top = containerRef.current.getBoundingClientRect().top + window.scrollY;
        setScrollMargin(top);
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const rowCount = Math.ceil(books.length / columnCount);
  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 430,
    overscan: 4,
    scrollMargin,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();

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
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {rows.map((row) => (
          <div
            key={row.key}
            data-index={row.index}
            ref={rowVirtualizer.measureElement}
            className="absolute left-0 top-0 grid w-full gap-4 pb-4"
            style={{
              transform: `translateY(${row.start - scrollMargin}px)`,
              gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
            }}
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
          <span className="ml-2 text-sm text-copy-muted">도서를 더 불러오는 중...</span>
        </div>
      )}
    </div>
  );
}
