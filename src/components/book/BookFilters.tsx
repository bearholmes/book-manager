import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Clock3, Search, SlidersHorizontal, X } from 'lucide-react';
import clsx from 'clsx';
import { BOOK_SORT_OPTIONS, STORAGE_KEYS } from '@/utils/constants';
import type { BookFilters as BookFiltersType, BookSort } from '@/types/book';
import { Spinner } from '@/components/ui/Spinner';

const MAX_RECENT_SEARCHES = 3;
interface RecentSearchItem {
  term: string;
  count?: number;
}

interface BookFiltersProps {
  filters: BookFiltersType;
  onChange: (filters: BookFiltersType) => void;
  sort?: BookSort;
  onSortChange?: (sort: BookSort) => void;
  showResultCount?: boolean;
  topics?: string[];
  purchasePlaces?: string[];
  isSearching?: boolean;
  resultCount?: number;
  className?: string;
}

function mergeAndSortOptions(current: string[], incoming: string[]) {
  return [...new Set([...current, ...incoming])].sort((a, b) => a.localeCompare(b));
}

/**
 * 도서 필터 컴포넌트
 * Vue 버전의 필터 기능 포팅
 */
export function BookFilters({
  filters,
  onChange,
  sort = { field: 'created_at', order: 'desc' },
  onSortChange,
  showResultCount = true,
  topics = [],
  purchasePlaces = [],
  isSearching = false,
  resultCount,
  className,
}: BookFiltersProps) {
  const normalizeSearchTerm = (term: string) => term.trim().replace(/\s+/g, ' ').slice(0, 40);

  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    const stored = window.localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];

      const mapped = parsed
        .map((value): RecentSearchItem | null => {
          if (typeof value === 'string') {
            const term = normalizeSearchTerm(value);
            return term ? { term } : null;
          }
          if (
            value &&
            typeof value === 'object' &&
            'term' in value &&
            typeof value.term === 'string'
          ) {
            const term = normalizeSearchTerm(value.term);
            if (!term) return null;
            return {
              term,
              count: typeof value.count === 'number' ? value.count : undefined,
            };
          }
          return null;
        })
        .filter((value): value is RecentSearchItem => value !== null);

      const unique = mapped.filter(
        (item, index, self) =>
          self.findIndex((candidate) => candidate.term === item.term) === index,
      );

      return unique.slice(0, MAX_RECENT_SEARCHES);
    } catch {
      return [];
    }
  });
  const [isMobileOpen, setIsMobileOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.localStorage.getItem(STORAGE_KEYS.MOBILE_FILTER_OPEN) === '1';
  });
  const [availableTopics, setAvailableTopics] = useState<string[]>(() =>
    mergeAndSortOptions([], topics),
  );
  const [availablePurchasePlaces, setAvailablePurchasePlaces] = useState<string[]>(() =>
    mergeAndSortOptions([], purchasePlaces),
  );
  const hasActiveFilters = !!(filters.topic || filters.purchase_place || filters.search);
  const isMobileViewport =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(max-width: 1023px)').matches;
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.MOBILE_FILTER_OPEN, isMobileOpen ? '1' : '0');
  }, [isMobileOpen]);

  useEffect(() => {
    setAvailableTopics((prev) => {
      const merged = mergeAndSortOptions(prev, topics);
      if (merged.length === prev.length && merged.every((value, index) => value === prev[index])) {
        return prev;
      }
      return merged;
    });
  }, [topics]);

  useEffect(() => {
    setAvailablePurchasePlaces((prev) => {
      const merged = mergeAndSortOptions(prev, purchasePlaces);
      if (merged.length === prev.length && merged.every((value, index) => value === prev[index])) {
        return prev;
      }
      return merged;
    });
  }, [purchasePlaces]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    const currentSearchTerm = normalizeSearchTerm(filters.search || '');
    if (!currentSearchTerm || typeof resultCount !== 'number' || isSearching) return;

    setRecentSearches((prev) => {
      let changed = false;
      const next = prev.map((item) => {
        if (item.term !== currentSearchTerm || item.count === resultCount) {
          return item;
        }
        changed = true;
        return { ...item, count: resultCount };
      });

      return changed ? next : prev;
    });
  }, [filters.search, isSearching, resultCount]);

  const addRecentSearch = (term: string, count?: number) => {
    const normalized = normalizeSearchTerm(term);
    if (!normalized) return;

    setRecentSearches((prev) => {
      const existing = prev.find((item) => item.term === normalized);
      const nextItem: RecentSearchItem = {
        term: normalized,
        count: typeof count === 'number' ? count : existing?.count,
      };
      const next = [nextItem, ...prev.filter((item) => item.term !== normalized)];
      return next.slice(0, MAX_RECENT_SEARCHES);
    });
  };

  const handleClearFilters = () => {
    onChange({});
    if (isMobileViewport) {
      setIsMobileOpen(false);
    }
  };

  const handleTopicChange = (topic: string) => {
    onChange({ ...filters, topic: topic || undefined });
    if (isMobileViewport) {
      setIsMobileOpen(false);
    }
  };

  const handlePurchasePlaceChange = (place: string) => {
    onChange({ ...filters, purchase_place: place || undefined });
    if (isMobileViewport) {
      setIsMobileOpen(false);
    }
  };

  const handleSearchChange = (search: string) => {
    onChange({ ...filters, search: search || undefined });
  };

  const handleSortChange = (value: string) => {
    if (!onSortChange) return;
    const [field, order] = value.split(':') as [BookSort['field'], BookSort['order']];
    onSortChange({ field, order });
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      addRecentSearch(
        event.currentTarget.value,
        typeof resultCount === 'number' ? resultCount : undefined,
      );
      if (isMobileViewport) {
        setIsMobileOpen(false);
      }
    }
  };

  const handleRecentSearchClick = (item: RecentSearchItem) => {
    addRecentSearch(item.term, item.count);
    onChange({ ...filters, search: item.term });
    if (isMobileViewport) {
      setIsMobileOpen(false);
    }
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
  };

  return (
    <section className={clsx('surface-card p-4 sm:p-5', className)} aria-label="도서 필터">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary-600" />
          <h2 className="text-base font-semibold text-primary-900">검색 필터</h2>
        </div>
        <div className="flex items-center gap-2">
          {showResultCount && typeof resultCount === 'number' && (
            <span className="text-sm font-semibold text-primary-700">총 {resultCount}권</span>
          )}
          {onSortChange && (
            <div className="w-[170px] sm:w-[190px]">
              <label htmlFor="book-sort" className="sr-only">
                정렬
              </label>
              <select
                id="book-sort"
                value={`${sort.field}:${sort.order}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="select-base h-8 !py-1.5 text-xs sm:text-sm"
              >
                {BOOK_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-primary-200 bg-white px-2.5 text-xs font-semibold text-primary-700 lg:hidden"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-expanded={isMobileOpen}
            aria-controls="book-filters-fields"
          >
            {isMobileOpen ? '접기' : '펼치기'}
            {isMobileOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {isSearching && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2.5 py-1 text-xs font-semibold text-accent-700">
              <Spinner size="sm" className="h-3 w-3 border-[1.5px]" />
              조회 중
            </span>
          )}
        </div>
      </div>

      <div
        id="book-filters-fields"
        className={clsx(
          'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6',
          isMobileOpen ? 'grid' : 'hidden lg:grid',
        )}
      >
        {/* 검색 */}
        <div className="relative lg:col-span-3">
          <label htmlFor="search" className="mb-1.5 block text-xs font-semibold text-primary-700">
            검색
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-primary-400" />
            </div>
            <input
              type="text"
              id="search"
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="field-base pl-10"
              placeholder="도서명, 저자, 출판사로 검색"
            />
          </div>

          {recentSearches.length > 0 && (
            <div className="mt-2">
              <div className="mb-1.5 flex items-center justify-between">
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  최근 검색어
                </div>
                <button
                  type="button"
                  onClick={handleClearRecentSearches}
                  className="text-xs font-semibold text-primary-500 hover:text-primary-700"
                >
                  지우기
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((item) => (
                  <button
                    key={item.term}
                    type="button"
                    onClick={() => handleRecentSearchClick(item)}
                    className="rounded-full border border-primary-200 bg-white px-2.5 py-1 text-xs font-medium text-primary-700 hover:border-primary-300 hover:bg-primary-50"
                  >
                    {item.term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 주제 필터 */}
        <div>
          <label
            htmlFor="topic-filter"
            className="mb-1.5 block text-xs font-semibold text-primary-700"
          >
            주제
          </label>
          <select
            id="topic-filter"
            value={filters.topic || ''}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="select-base"
          >
            <option value="">전체 주제</option>
            {availableTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        {/* 구매처 필터 */}
        <div>
          <label
            htmlFor="purchase-place-filter"
            className="mb-1.5 block text-xs font-semibold text-primary-700"
          >
            구매처
          </label>
          <select
            id="purchase-place-filter"
            value={filters.purchase_place || ''}
            onChange={(e) => handlePurchasePlaceChange(e.target.value)}
            className="select-base"
          >
            <option value="">전체 구매처</option>
            {availablePurchasePlaces.map((place) => (
              <option key={place} value={place}>
                {place}
              </option>
            ))}
          </select>
        </div>

        {/* 초기화 버튼 */}
        <div className="flex items-end lg:col-span-1 lg:justify-end">
          <button
            type="button"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className={clsx(
              'inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors lg:w-auto lg:min-w-[120px]',
              hasActiveFilters
                ? 'border-primary-200 bg-white text-primary-700 hover:border-primary-300 hover:bg-primary-50'
                : 'border-primary-100 bg-white text-primary-400',
            )}
          >
            <X className="h-4 w-4" />
            필터 초기화
          </button>
        </div>
      </div>
    </section>
  );
}
