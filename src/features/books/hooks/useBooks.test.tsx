import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { desktop } from '@/shared/api/desktop';
import { mockBooks } from '@/test/mockData';
import { useBooks } from './useBooks';

vi.mock('@/shared/api/desktop', () => ({ desktop: vi.fn() }));

describe('useBooks', () => {
  beforeEach(() => vi.clearAllMocks());
  it('로컬 저장소로 필터와 정렬을 전달한다', async () => {
    vi.mocked(desktop).mockResolvedValue({
      books: mockBooks,
      totalCount: 2,
      nextOffset: 2,
      hasMore: false,
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const options = {
      filters: { search: "O'Reilly%", topic: '프로그래밍' },
      sort: { field: 'book_name' as const, order: 'asc' as const },
    };
    const { result } = renderHook(() => useBooks(options), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockBooks);
    expect(desktop).toHaveBeenCalledWith('list', { ...options, limit: 5000 });
    client.clear();
  });
});
