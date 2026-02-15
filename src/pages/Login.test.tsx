import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, renderWithProviders, userEvent } from '@/test/test-utils';
import { Login } from './Login';

const loginMocks = vi.hoisted(() => ({
  mutate: vi.fn(),
}));

vi.mock('@/features/auth/hooks/useLogin', () => ({
  useLogin: () => ({
    mutate: loginMocks.mutate,
    isPending: false,
  }),
}));

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('비밀번호 찾기 링크를 노출해야 함', () => {
    renderWithProviders(<Login />);

    const forgotPasswordLink = screen.getByRole('link', { name: '비밀번호 찾기' });
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
  });

  it('유효한 입력으로 로그인 제출 시 mutate를 호출해야 함', async () => {
    renderWithProviders(<Login />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('이메일'), 'reader@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'Test1234!');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(loginMocks.mutate).toHaveBeenCalledWith({
        email: 'reader@example.com',
        password: 'Test1234!',
      });
    });
  });
});
