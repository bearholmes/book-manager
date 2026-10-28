import type { LibraryStats } from '@contracts/desktop';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { desktop } from '@/shared/api/desktop';
import { createTestQueryClient, renderWithProviders } from '@/test/test-utils';
import { QUERY_KEYS } from '../api/query-keys';
import { StatisticsCharts } from './StatisticsCharts';

vi.mock('@/shared/api/desktop', () => ({ desktop: vi.fn() }));
const empty: LibraryStats = { total: 0, missingImages: 0, topics: [], places: [], years: [] };
beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.mocked(desktop).mockReset();
});

it('distinguishes an initial error from empty data and recovers through retry', async () => {
  vi.mocked(desktop).mockRejectedValueOnce(new Error('Synthetic failure')).mockResolvedValue(empty);
  renderWithProviders(<StatisticsCharts />);
  expect(await screen.findByRole('alert')).toHaveTextContent('통계를 불러오지 못했습니다');
  expect(screen.queryByText('통계 데이터가 없습니다. 도서를 추가해주세요.')).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(
    await screen.findByText('통계 데이터가 없습니다. 도서를 추가해주세요.'),
  ).toBeInTheDocument();
  expect(screen.queryByRole('alert')).toBeNull();
});

it('labels a failed refresh while keeping the last successful statistics', async () => {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(QUERY_KEYS.BOOK_STATS, empty);
  vi.mocked(desktop).mockRejectedValue(new Error('Synthetic refresh failure'));
  renderWithProviders(<StatisticsCharts />, { queryClient });
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('이전 조회 결과'));
  expect(queryClient.getQueryData(QUERY_KEYS.BOOK_STATS)).toEqual(empty);
});
