import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, screen, waitFor, renderWithProviders, userEvent } from '@/test/test-utils';
import { ForgotPassword } from './ForgotPassword';

const forgotPasswordMocks = vi.hoisted(() => ({
  mutate: vi.fn(),
}));

vi.mock('@/features/auth/hooks/useForgotPassword', () => ({
  useForgotPassword: () => ({
    mutate: forgotPasswordMocks.mutate,
    isPending: false,
  }),
}));

describe('ForgotPassword Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('재설정 메일 제출 시 mutate를 호출해야 함', async () => {
    renderWithProviders(<ForgotPassword />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('이메일'), 'reader@example.com');
    await user.click(screen.getByRole('button', { name: '재설정 메일 보내기' }));

    await waitFor(() => {
      expect(forgotPasswordMocks.mutate).toHaveBeenCalledTimes(1);
    });

    const firstCall = forgotPasswordMocks.mutate.mock.calls[0];
    expect(firstCall).toBeDefined();
    const [payload, callbacks] = firstCall as [any, { onSuccess: () => void }];
    expect(payload).toEqual({ email: 'reader@example.com' });
    expect(callbacks).toEqual(expect.objectContaining({ onSuccess: expect.any(Function) }));
  });

  it('성공 콜백 호출 시 발송 안내 박스를 노출해야 함', async () => {
    renderWithProviders(<ForgotPassword />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('이메일'), 'reader@example.com');
    await user.click(screen.getByRole('button', { name: '재설정 메일 보내기' }));

    const firstCall = forgotPasswordMocks.mutate.mock.calls[0];
    expect(firstCall).toBeDefined();
    const [, callbacks] = firstCall as [any, { onSuccess: () => void }];
    act(() => {
      callbacks.onSuccess();
    });

    await waitFor(() => {
      expect(screen.getByText('메일 발송 완료')).toBeInTheDocument();
    });
    expect(screen.getByText(/reader@example\.com/)).toBeInTheDocument();
  });
});
