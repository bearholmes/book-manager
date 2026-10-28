import { fireEvent, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { desktop } from '@/shared/api/desktop';
import { renderWithProviders } from '@/test/test-utils';
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
  const settings = {
    enabled: false,
    executable: '/usr/local/bin/codex',
    model: 'gpt-6.1-terra',
    reasoningEffort: 'medium' as const,
  };
  vi.mocked(desktop).mockImplementation(async (command, payload) => {
    if (command === 'codexSettingsSet') return { ...settings, ...payload };
    if (command === 'codexAvailability')
      return {
        state: 'ready',
        models: [
          {
            id: 'gpt-6.1-terra',
            name: 'Terra',
            reasoningEfforts: ['medium', 'high'],
            defaultReasoningEffort: 'medium',
          },
        ],
      };
    return settings;
  });
  renderWithProviders(<Settings />);
  expect(screen.getByRole('heading', { name: 'PIN 잠금' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '백업 복원' })).toBeInTheDocument();
  expect(screen.queryByText('저장소')).not.toBeInTheDocument();
  const toggle = await screen.findByRole('switch', { name: 'AI 도우미' });
  expect(screen.queryByLabelText('AI 모델')).toBeNull();
  fireEvent.click(toggle);
  expect(await screen.findByRole('option', { name: 'Terra' })).toBeInTheDocument();
  expect(screen.queryByLabelText('Codex 실행 파일')).toBeNull();
  expect(screen.queryByRole('button', { name: '실행 확인' })).toBeNull();
  expect(screen.getByRole('button', { name: '연결 확인' })).toBeInTheDocument();
  expect(screen.getByLabelText('AI 모델')).toHaveValue('gpt-6.1-terra');
  expect(desktop).toHaveBeenCalledWith('codexSettingsGet', {});
  expect(desktop).not.toHaveBeenCalledWith('info', expect.anything());
  fireEvent.click(toggle);
  await screen.findByText('꺼짐');
  expect(screen.queryByLabelText('AI 모델')).toBeNull();
});
