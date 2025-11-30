import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useBooks } from './useBooks';
import { supabase } from '@/lib/supabase';

// Supabase 모킹
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('useBooks', () => {
  let queryClient: QueryClient;

  const mockBooks = [
    {
      id: 'book-1',
      book_name: '클린 코드',
      author: '로버트 C. 마틴',
      publisher: '인사이트',
      topic: '프로그래밍',
      purchase_place: '교보문고',
      condition: '신품',
      purchase_price: 33000,
      currency: 'KRW',
      created_at: '2024-01-01T00:00:00Z',
      user_id: 'user-1',
    },
    {
      id: 'book-2',
      book_name: '리팩터링',
      author: '마틴 파울러',
      publisher: '한빛미디어',
      topic: '프로그래밍',
      purchase_place: '알라딘',
      condition: '중고',
      purchase_price: 25000,
      currency: 'KRW',
      created_at: '2024-01-02T00:00:00Z',
      user_id: 'user-1',
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('도서 목록을 성공적으로 조회해야 함', async () => {
    const selectMock = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: mockBooks,
        error: null,
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as any);

    const { result } = renderHook(() => useBooks(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockBooks);
    expect(supabase.from).toHaveBeenCalledWith('books');
    expect(selectMock).toHaveBeenCalledWith('*');
  });

  it('에러 발생 시 처리해야 함', async () => {
    const mockError = new Error('Database error');

    const selectMock = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as any);

    const { result } = renderHook(() => useBooks(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('주제 필터가 적용되어야 함', async () => {
    const eqMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockResolvedValue({
      data: [mockBooks[0]],
      error: null,
    });

    const selectMock = vi.fn().mockReturnValue({
      eq: eqMock,
      order: orderMock,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as any);

    const { result } = renderHook(
      () => useBooks({ filters: { topic: '프로그래밍' } }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(eqMock).toHaveBeenCalledWith('topic', '프로그래밍');
  });

  it('구매처 필터가 적용되어야 함', async () => {
    const eqMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockResolvedValue({
      data: [mockBooks[0]],
      error: null,
    });

    const selectMock = vi.fn().mockReturnValue({
      eq: eqMock,
      order: orderMock,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as any);

    const { result } = renderHook(
      () => useBooks({ filters: { purchase_place: '교보문고' } }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(eqMock).toHaveBeenCalledWith('purchase_place', '교보문고');
  });

  it('상태 필터가 적용되어야 함', async () => {
    const eqMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockResolvedValue({
      data: [mockBooks[0]],
      error: null,
    });

    const selectMock = vi.fn().mockReturnValue({
      eq: eqMock,
      order: orderMock,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as any);

    const { result } = renderHook(() => useBooks({ filters: { condition: '신품' } }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(eqMock).toHaveBeenCalledWith('condition', '신품');
  });

  it('검색 필터가 적용되어야 함', async () => {
    const orMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockResolvedValue({
      data: mockBooks,
      error: null,
    });

    const selectMock = vi.fn().mockReturnValue({
      or: orMock,
      order: orderMock,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as any);

    const { result } = renderHook(() => useBooks({ filters: { search: '클린' } }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(orMock).toHaveBeenCalledWith(
      'book_name.ilike.%클린%,author.ilike.%클린%,publisher.ilike.%클린%'
    );
  });

  it('여러 필터를 동시에 적용할 수 있어야 함', async () => {
    const eqMock = vi.fn().mockReturnThis();
    const orMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockResolvedValue({
      data: [mockBooks[0]],
      error: null,
    });

    const selectMock = vi.fn().mockReturnValue({
      eq: eqMock,
      or: orMock,
      order: orderMock,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as any);

    const { result } = renderHook(
      () =>
        useBooks({
          filters: {
            topic: '프로그래밍',
            purchase_place: '교보문고',
            search: '클린',
          },
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(eqMock).toHaveBeenCalledWith('topic', '프로그래밍');
    expect(eqMock).toHaveBeenCalledWith('purchase_place', '교보문고');
    expect(orMock).toHaveBeenCalled();
  });

  it('정렬 옵션이 적용되어야 함 (오름차순)', async () => {
    const orderMock = vi.fn().mockResolvedValue({
      data: mockBooks,
      error: null,
    });

    const selectMock = vi.fn().mockReturnValue({
      order: orderMock,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as any);

    const { result } = renderHook(
      () => useBooks({ sort: { field: 'book_name', order: 'asc' } }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(orderMock).toHaveBeenCalledWith('book_name', { ascending: true });
  });

  it('정렬 옵션이 적용되어야 함 (내림차순)', async () => {
    const orderMock = vi.fn().mockResolvedValue({
      data: mockBooks,
      error: null,
    });

    const selectMock = vi.fn().mockReturnValue({
      order: orderMock,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as any);

    const { result } = renderHook(
      () => useBooks({ sort: { field: 'created_at', order: 'desc' } }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('기본 정렬은 최신순이어야 함', async () => {
    const orderMock = vi.fn().mockResolvedValue({
      data: mockBooks,
      error: null,
    });

    const selectMock = vi.fn().mockReturnValue({
      order: orderMock,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as any);

    const { result } = renderHook(() => useBooks(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('빈 결과를 반환할 수 있어야 함', async () => {
    const selectMock = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as any);

    const { result } = renderHook(() => useBooks(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it('data가 null일 때 빈 배열을 반환해야 함', async () => {
    const selectMock = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as any);

    const { result } = renderHook(() => useBooks(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });
});
