import { desktop } from '@/shared/api/desktop';
import { mockBook } from '@/test/mockData';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useCreateBook } from './useCreateBook';

vi.mock('@/shared/api/desktop', () => ({ desktop: vi.fn() }));
vi.mock('@/shared/notifications/hooks/useToast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}));

describe('useCreateBook', () => {
  it('계정 없이 로컬 도서를 등록하고 목록과 통계를 무효화한다', async () => {
    vi.mocked(desktop).mockResolvedValue(mockBook);
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const { result } = renderHook(() => useCreateBook(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });
    await act(async () => {
      await result.current.mutateAsync({ book_name: '클린 코드' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(desktop).toHaveBeenCalledWith('create', { book_name: '클린 코드' });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['books'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['book-stats'] });
    client.clear();
  });
});
