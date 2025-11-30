import { Search, X } from 'lucide-react';
import type { BookFilters as BookFiltersType } from '@/types/book';

interface BookFiltersProps {
  filters: BookFiltersType;
  onChange: (filters: BookFiltersType) => void;
  topics?: string[];
  purchasePlaces?: string[];
  className?: string;
}

/**
 * 도서 필터 컴포넌트
 * Vue 버전의 필터 기능 포팅
 */
export function BookFilters({
  filters,
  onChange,
  topics = [],
  purchasePlaces = [],
  className,
}: BookFiltersProps) {
  const hasActiveFilters = !!(filters.topic || filters.purchase_place || filters.search);

  const handleClearFilters = () => {
    onChange({});
  };

  const handleTopicChange = (topic: string) => {
    onChange({ ...filters, topic: topic || undefined });
  };

  const handlePurchasePlaceChange = (place: string) => {
    onChange({ ...filters, purchase_place: place || undefined });
  };

  const handleSearchChange = (search: string) => {
    onChange({ ...filters, search: search || undefined });
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 검색 */}
        <div className="relative">
          <label htmlFor="search" className="sr-only">
            검색
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="도서명, 저자, 출판사로 검색"
            />
          </div>
        </div>

        {/* 주제 필터 */}
        <div>
          <label htmlFor="topic-filter" className="sr-only">
            주제
          </label>
          <select
            id="topic-filter"
            value={filters.topic || ''}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">전체 주제</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        {/* 구매처 필터 */}
        <div>
          <label htmlFor="purchase-place-filter" className="sr-only">
            구매처
          </label>
          <select
            id="purchase-place-filter"
            value={filters.purchase_place || ''}
            onChange={(e) => handlePurchasePlaceChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">전체 구매처</option>
            {purchasePlaces.map((place) => (
              <option key={place} value={place}>
                {place}
              </option>
            ))}
          </select>
        </div>

        {/* 초기화 버튼 */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="mr-2 h-4 w-4" />
            필터 초기화
          </button>
        </div>
      </div>
    </div>
  );
}
