import { desktop } from '@/shared/api/desktop';
import { renderWithProviders } from '@/test/test-utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { Settings } from './Settings';

vi.mock('@/features/lock', () => ({
  PinSettings: () => null,
  useLock: () => ({ state: { enabled: false }, refresh: vi.fn() }),
}));
vi.mock('@/features/data-management', () => ({ DataSettings: () => null }));
vi.mock('@/shared/api/desktop', () => ({ desktop: vi.fn() }));

it('reports storage information failures and retries instead of loading forever', async () => {
  vi.stubGlobal('__APP_VERSION__', 'test');
  try {
    vi.mocked(desktop)
      .mockRejectedValueOnce(new Error('Synthetic failure'))
      .mockResolvedValue({ databasePath: '/synthetic/books.vault' });
    renderWithProviders(<Settings />);
    expect(await screen.findByRole('alert')).toHaveTextContent('저장소 정보 조회에 실패');
    expect(screen.queryByText('저장 위치 확인 중…')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(await screen.findByText('/synthetic/books.vault')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  } finally {
    vi.unstubAllGlobals();
    vi.mocked(desktop).mockReset();
  }
});
