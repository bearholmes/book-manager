import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useForgotPassword } from './useForgotPassword';
import { ROUTES } from '@/utils/constants';
import { supabase } from '@/lib/supabase';

const toastMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => toastMocks,
}));

describe('useForgotPassword', () => {
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

  it('재설정 메일 발송을 요청하고 성공 토스트를 표시해야 함', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error: null,
    } as any);

    const { result } = renderHook(() => useForgotPassword(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ email: 'reader@example.com' });

    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('reader@example.com', {
      redirectTo: `${window.location.origin}${ROUTES.RESET_PASSWORD}`,
    });
    expect(toastMocks.success).toHaveBeenCalledWith(
      '비밀번호 재설정 메일을 보냈습니다. 메일함을 확인해주세요.',
    );
  });

  it('발송 실패 시 에러 토스트를 표시해야 함', async () => {
    const requestError = new Error('rate limit');
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: null,
      error: requestError,
    } as any);

    const { result } = renderHook(() => useForgotPassword(), {
      wrapper: createWrapper(),
    });

    await expect(result.current.mutateAsync({ email: 'reader@example.com' })).rejects.toThrow(
      'rate limit',
    );

    expect(toastMocks.error).toHaveBeenCalledWith('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
  });
});
