import { desktop } from '@/shared/api/desktop';
import { renderWithProviders } from '@/test/test-utils';
import { screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Settings } from './Settings';

vi.mock('@/features/lock', () => ({
  PinSettings: () => <h2>PIN 잠금</h2>,
  useLock: () => ({ state: { enabled: false }, refresh: vi.fn() }),
}));
vi.mock('@/features/data-management', () => ({
  DataSettings: () => <h2>백업 복원</h2>,
}));
vi.mock('@/shared/api/desktop', () => ({ desktop: vi.fn() }));

it('loads helper settings without fetching or exposing internal storage information', async () => {
  vi.mocked(desktop).mockResolvedValue({
    executable: '/usr/local/bin/codex',
    model: 'gpt-6.1-terra',
    reasoningEffort: 'medium',
  });
  renderWithProviders(<Settings />);
  expect(screen.getByRole('heading', { name: 'PIN 잠금' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '백업 복원' })).toBeInTheDocument();
  expect(screen.queryByText('저장소')).not.toBeInTheDocument();
  expect(await screen.findByLabelText('AI 모델')).toHaveValue('gpt-6.1-terra');
  expect(desktop).toHaveBeenCalledWith('codexSettingsGet', {});
  expect(desktop).not.toHaveBeenCalledWith('info', expect.anything());
});
