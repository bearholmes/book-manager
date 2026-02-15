import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

// Supabase 모킹
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

describe('useAuth', () => {
  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };

  const mockSession: Session = {
    user: mockUser,
    access_token: 'test-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'bearer',
  };

  let unsubscribeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    unsubscribeMock = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('초기 세션을 확인하고 사용자를 설정해야 함', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } },
    } as any);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    expect(supabase.auth.getSession).toHaveBeenCalledOnce();
  });

  it('세션이 없으면 user를 null로 설정해야 함', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } },
    } as any);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });
  });

  it('인증 상태 변경 리스너를 등록해야 함', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } },
    } as any);

    renderHook(() => useAuth());

    await waitFor(() => {
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledOnce();
    });
  });

  it('언마운트 시 구독을 취소해야 함', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } },
    } as any);

    const { unmount } = renderHook(() => useAuth());

    unmount();

    expect(unsubscribeMock).toHaveBeenCalledOnce();
  });

  it('인증 상태 변경 시 사용자가 업데이트되어야 함', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } },
    } as any);

    const { result } = renderHook(() => useAuth());

    // 초기 상태: null
    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });

    // 로그인 이벤트 시뮬레이션
    const authStateCallback = vi.mocked(supabase.auth.onAuthStateChange).mock.calls[0]?.[0] as
      | ((event: string, session: Session | null) => void)
      | undefined;
    expect(authStateCallback).toBeDefined();
    authStateCallback?.('SIGNED_IN', mockSession);

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });
  });

  it('로그아웃 시 사용자가 null로 설정되어야 함', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } },
    } as any);

    const { result } = renderHook(() => useAuth());

    // 초기 상태: 로그인됨
    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    // 로그아웃 이벤트 시뮬레이션
    const authStateCallback = vi.mocked(supabase.auth.onAuthStateChange).mock.calls[0]?.[0] as
      | ((event: string, session: Session | null) => void)
      | undefined;
    expect(authStateCallback).toBeDefined();
    authStateCallback?.('SIGNED_OUT', null);

    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });
  });
});
