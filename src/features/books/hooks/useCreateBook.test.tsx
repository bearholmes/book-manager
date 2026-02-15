import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateBook } from './useCreateBook';
import { supabase } from '@/lib/supabase';
import type { ReactNode } from 'react';

// Supabase 모킹
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Toast 모킹
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('useCreateBook', () => {
  let queryClient: QueryClient;

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockBookData = {
    book_name: '클린 코드',
    author: '로버트 C. 마틴',
    publisher: '인사이트',
    topic: '프로그래밍',
  };

  const mockCreatedBook = {
    id: 'test-book-id',
    user_id: mockUser.id,
    ...mockBookData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('도서를 성공적으로 추가해야 함', async () => {
    // Supabase auth 모킹
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser as any },
      error: null,
    });

    // Supabase insert 모킹
    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: mockCreatedBook,
          error: null,
        }),
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      insert: insertMock,
    } as any);

    const { result } = renderHook(() => useCreateBook(), { wrapper });

    result.current.mutate(mockBookData as any);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(supabase.auth.getUser).toHaveBeenCalledOnce();
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ...mockBookData,
        user_id: mockUser.id,
      })
    );
  });

  it('인증되지 않은 경우 에러를 발생시켜야 함', async () => {
    // 인증되지 않은 상태 모킹
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null as any },
      error: null,
    });

    const { result } = renderHook(() => useCreateBook(), { wrapper });

    result.current.mutate(mockBookData as any);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(
      new Error('인증되지 않았습니다. 로그인 후 다시 시도해주세요.')
    );
  });

  it('Supabase 에러 발생 시 처리해야 함', async () => {
    const mockError = {
      message: 'Database error',
      code: '23505',
      details: 'Duplicate key',
      hint: '',
    };

    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser as any },
      error: null,
    });

    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      insert: insertMock,
    } as any);

    const { result } = renderHook(() => useCreateBook(), { wrapper });

    result.current.mutate(mockBookData as any);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });

  it.skip('isPending 상태가 올바르게 변경되어야 함', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser as any },
      error: null,
    });

    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: mockCreatedBook,
          error: null,
        }),
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      insert: insertMock,
    } as any);

    const { result } = renderHook(() => useCreateBook(), { wrapper });

    expect(result.current.isPending).toBe(false);

    result.current.mutate(mockBookData as any);

    // mutation이 진행 중일 때는 isPending이 true
    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });

  it('user_id가 자동으로 추가되어야 함', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser as any },
      error: null,
    });

    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: mockCreatedBook,
          error: null,
        }),
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      insert: insertMock,
    } as any);

    const { result } = renderHook(() => useCreateBook(), { wrapper });

    result.current.mutate(mockBookData as any);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // user_id가 자동으로 추가되었는지 확인
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: mockUser.id,
      })
    );
  });

  it.skip('성공 시 onSuccess 콜백이 호출되어야 함', async () => {
    const onSuccess = vi.fn();

    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser as any },
      error: null,
    });

    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: mockCreatedBook,
          error: null,
        }),
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      insert: insertMock,
    } as any);

    const { result } = renderHook(() => useCreateBook(), { wrapper });

    result.current.mutate(mockBookData as any, { onSuccess });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });

    expect(onSuccess).toHaveBeenCalledWith(mockCreatedBook, mockBookData, undefined);
  });

  it.skip('에러 시 onError 콜백이 호출되어야 함', async () => {
    const onError = vi.fn();
    const mockError = new Error('Test error');

    vi.mocked(supabase.auth.getUser).mockRejectedValue(mockError);

    const { result } = renderHook(() => useCreateBook(), { wrapper });

    result.current.mutate(mockBookData as any, { onError });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledOnce();
    });

    expect(onError).toHaveBeenCalledWith(mockError, mockBookData, undefined);
  });
});
