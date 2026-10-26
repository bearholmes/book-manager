import { desktop } from '@/shared/api/desktop';
import { renderWithProviders, userEvent } from '@/test/test-utils';
import { screen, within } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { PinSettings } from './PinSettings';

const lock = vi.hoisted(() => ({
  state: { enabled: false, locked: false },
  refresh: vi.fn(),
}));
vi.mock('./LockProvider', () => ({ useLock: () => lock }));
vi.mock('@/shared/api/desktop', () => ({ desktop: vi.fn() }));

beforeEach(() => {
  lock.state.enabled = false;
  lock.refresh.mockReset().mockImplementation(async () => {
    lock.state.enabled = !lock.state.enabled;
  });
  vi.mocked(desktop)
    .mockReset()
    .mockResolvedValue(undefined as never);
});

it('asks for a PIN only after enabling and clears cancelled input', async () => {
  const user = userEvent.setup();
  renderWithProviders(<PinSettings />);
  expect(screen.queryByLabelText('PIN (숫자 4자리)')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '켜기' }));
  await user.type(screen.getByLabelText('PIN (숫자 4자리)'), '0123');
  await user.click(screen.getByRole('button', { name: '취소' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(desktop).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: '켜기' }));
  expect(screen.getByLabelText('PIN (숫자 4자리)')).toHaveValue('');
});

it('enables the lock and replaces the action with disable', async () => {
  const user = userEvent.setup();
  renderWithProviders(<PinSettings />);
  await user.click(screen.getByRole('button', { name: '켜기' }));
  await user.type(screen.getByLabelText('PIN (숫자 4자리)'), '0123');
  await user.type(screen.getByLabelText('PIN 확인'), '0123');
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: '켜기' }));
  expect(desktop).toHaveBeenCalledWith('setPin', { currentPin: undefined, newPin: '0123' });
  expect(await screen.findByRole('button', { name: '끄기' })).toBeVisible();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('keeps the current PIN check when disabling and allows retry after an error', async () => {
  lock.state.enabled = true;
  vi.mocked(desktop).mockRejectedValueOnce(new Error('PIN이 일치하지 않습니다.'));
  const user = userEvent.setup();
  renderWithProviders(<PinSettings />);
  await user.click(screen.getByRole('button', { name: '끄기' }));
  const dialog = within(screen.getByRole('dialog'));
  expect(dialog.queryByLabelText('PIN 확인')).not.toBeInTheDocument();
  expect(dialog.getByRole('button', { name: '끄기' })).toBeDisabled();
  await user.type(dialog.getByLabelText('현재 PIN'), '9999');
  await user.click(dialog.getByRole('button', { name: '끄기' }));
  expect(await dialog.findByRole('alert')).toHaveTextContent('PIN이 일치하지 않습니다.');
  expect(lock.refresh).not.toHaveBeenCalled();
  await user.clear(dialog.getByLabelText('현재 PIN'));
  await user.type(dialog.getByLabelText('현재 PIN'), '0123');
  await user.click(dialog.getByRole('button', { name: '끄기' }));
  expect(desktop).toHaveBeenLastCalledWith('setPin', { currentPin: '0123', newPin: null });
  expect(await screen.findByRole('button', { name: '켜기' })).toBeVisible();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
