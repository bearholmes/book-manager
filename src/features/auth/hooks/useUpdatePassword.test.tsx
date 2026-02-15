import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUpdatePassword } from './useUpdatePassword';
import { supabase } from '@/lib/supabase';

const toastMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
    },
  },
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => toastMocks,
}));

describe('useUpdatePassword', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('비밀번호 변경 성공 시 성공 토스트를 표시해야 함', async () => {
    vi.mocked(supabase.auth.updateUser).mockResolvedValue({
      data: {},
      error: null,
    } as any);

    const { result } = renderHook(() => useUpdatePassword(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ password: 'NewStrongPass123!' });

    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      password: 'NewStrongPass123!',
    });
    expect(toastMocks.success).toHaveBeenCalledWith('비밀번호가 변경되었습니다.');
  });

  it('비밀번호 변경 실패 시 에러 토스트를 표시해야 함', async () => {
    const requestError = new Error('invalid token');
    vi.mocked(supabase.auth.updateUser).mockResolvedValue({
      data: null,
      error: requestError,
    } as any);

    const { result } = renderHook(() => useUpdatePassword(), {
      wrapper: createWrapper(),
    });

    await expect(result.current.mutateAsync({ password: 'NewStrongPass123!' })).rejects.toThrow(
      'invalid token',
    );

    expect(toastMocks.error).toHaveBeenCalledWith('invalid token');
  });
});
