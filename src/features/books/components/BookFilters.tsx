import { Button } from '@/shared/ui/Button';
import { Input, Select } from '@/shared/ui/Input';
import { Spinner } from '@/shared/ui/Spinner';
import type { BookFilters as BookFiltersType, BookSort } from '@contracts/book';
import clsx from 'clsx';
import { RotateCcw, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BOOK_SORT_OPTIONS } from '../model/constants';
import styles from './BookFilters.module.css';

interface BookFiltersProps {
  filters: BookFiltersType;
  onChange: (filters: BookFiltersType) => void;
  sort?: BookSort;
  onSortChange?: (sort: BookSort) => void;
  topics?: string[];
  purchasePlaces?: string[];
  isSearching?: boolean;
  className?: string;
}

function mergeOptions(current: string[], incoming: string[]) {
  const next = [...new Set([...current, ...incoming])].sort((a, b) => a.localeCompare(b));
  return next.length === current.length && next.every((value, index) => value === current[index])
    ? current
    : next;
}

export function BookFilters({
  filters,
  onChange,
  sort = { field: 'created_at', order: 'desc' },
  onSortChange,
  topics = [],
  purchasePlaces = [],
  isSearching = false,
  className,
}: BookFiltersProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [availableTopics, setTopics] = useState(() => mergeOptions([], topics));
  const [availablePlaces, setPlaces] = useState(() => mergeOptions([], purchasePlaces));
  useEffect(() => {
    setTopics((previous) => mergeOptions(previous, topics));
  }, [topics]);
  useEffect(() => {
    setPlaces((previous) => mergeOptions(previous, purchasePlaces));
  }, [purchasePlaces]);
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((!event.metaKey && !event.ctrlKey) || event.key.toLowerCase() !== 'f') return;
      event.preventDefault();
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);
  const active = !!(filters.search || filters.topic || filters.purchase_place || filters.condition);

  return (
    <form
      className={clsx(styles.toolbar, className)}
      aria-label="도서 검색 및 필터"
      // biome-ignore lint/a11y/useSemanticElements: Search forms support native WebViews without the newer search element.
      role="search"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className={styles.search}>
        <label htmlFor="search" className="sr-only">
          검색
        </label>
        <Search className={styles.searchIcon} size={16} aria-hidden="true" />
        <Input
          ref={searchRef}
          id="search"
          withLeadingIcon
          value={filters.search || ''}
          maxLength={500}
          aria-busy={isSearching}
          onChange={(event) => onChange({ ...filters, search: event.target.value || undefined })}
          placeholder="도서명, 저자, 출판사, ISBN으로 검색"
        />
        {isSearching && (
          <span className={styles.pending} aria-hidden="true">
            <Spinner size="inline" />
          </span>
        )}
      </div>
      <div>
        <label htmlFor="topic-filter" className="sr-only">
          주제
        </label>
        <Select
          id="topic-filter"
          value={filters.topic || ''}
          onChange={(event) => onChange({ ...filters, topic: event.target.value || undefined })}
        >
          <option value="">전체 주제</option>
          {availableTopics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label htmlFor="purchase-place-filter" className="sr-only">
          구매처
        </label>
        <Select
          id="purchase-place-filter"
          value={filters.purchase_place || ''}
          onChange={(event) =>
            onChange({ ...filters, purchase_place: event.target.value || undefined })
          }
        >
          <option value="">전체 구매처</option>
          {availablePlaces.map((place) => (
            <option key={place} value={place}>
              {place}
            </option>
          ))}
        </Select>
      </div>
      {onSortChange && (
        <div>
          <label htmlFor="book-sort" className="sr-only">
            정렬
          </label>
          <Select
            id="book-sort"
            value={`${sort.field}:${sort.order}`}
            onChange={(event) => {
              const [field, order] = event.target.value.split(':') as [
                BookSort['field'],
                BookSort['order'],
              ];
              onSortChange({ field, order });
            }}
          >
            {BOOK_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      )}
      <Button
        variant="ghost"
        size="icon"
        className={styles.reset}
        disabled={!active}
        aria-label="필터 초기화"
        title="필터 초기화"
        onClick={() => onChange({})}
      >
        <RotateCcw size={16} aria-hidden="true" />
      </Button>
    </form>
  );
}
