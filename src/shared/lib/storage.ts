export const STORAGE_KEYS = {
  THEME: 'book-manager-theme',
  FILTER_PRESET: 'book-manager-filter-preset',
  MOBILE_FILTER_OPEN: 'book-manager-mobile-filter-open',
  SEARCH_HISTORY: 'book-manager-search-history',
} as const;

export function clearLibraryPreferences() {
  for (const key of Object.values(STORAGE_KEYS)) window.localStorage.removeItem(key);
}
