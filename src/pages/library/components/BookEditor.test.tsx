import { desktop } from '@/shared/api/desktop';
import { ToastContainer } from '@/shared/notifications/components/ToastContainer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'jotai';
import { beforeEach, expect, it, vi } from 'vitest';
import { BookEditor } from './BookEditor';

vi.mock('@/shared/api/desktop', () => ({ desktop: vi.fn() }));
const settings = {
  enabled: true,
  executable: '/bin/codex',
  model: 'test',
  reasoningEffort: 'medium' as const,
};
beforeEach(() => {
  vi.mocked(desktop).mockReset();
});
function setup() {
  render(
    <Provider>
      <QueryClientProvider client={new QueryClient()}>
        <BookEditor onSubmit={() => {}} onCancel={() => {}} />
        <ToastContainer />
      </QueryClientProvider>
    </Provider>,
  );
  fireEvent.change(screen.getByLabelText('ISBN-13'), { target: { value: '9788966260959' } });
}
it.each(['cancel', 'isbn'])(
  'dismisses duplicate confirmation on %s and asks again',
  async (kind) => {
    vi.mocked(desktop).mockImplementation(async (command) =>
      command === 'codexSettingsGet' ? settings : [{ id: 'existing', book_name: '기존 책' }],
    );
    setup();
    fireEvent.click(await screen.findByRole('button', { name: '정보 찾기' }));
    await screen.findByRole('button', { name: '계속 입력' });
    if (kind === 'cancel') fireEvent.click(screen.getByRole('button', { name: '조사 취소' }));
    else
      fireEvent.change(screen.getByLabelText('ISBN-13'), { target: { value: '978-8966260959' } });
    await waitFor(() => expect(screen.queryByRole('button', { name: '계속 입력' })).toBeNull());
    fireEvent.click(await screen.findByRole('button', { name: '정보 찾기' }));
    await screen.findByRole('button', { name: '계속 입력' });
    expect(
      vi
        .mocked(desktop)
        .mock.calls.every(([command]) => ['findDuplicates', 'codexSettingsGet'].includes(command)),
    ).toBe(true);
  },
);
it('does not show a late duplicate response after cancellation', async () => {
  let respond!: () => void;
  vi.mocked(desktop).mockImplementation((command) =>
    command === 'codexSettingsGet'
      ? Promise.resolve(settings)
      : new Promise((resolve) => {
          respond = () => resolve([{ id: 'existing', book_name: '기존 책' }]);
        }),
  );
  setup();
  fireEvent.click(await screen.findByRole('button', { name: '정보 찾기' }));
  fireEvent.click(screen.getByRole('button', { name: '조사 취소' }));
  await act(async () => respond());
  expect(screen.queryByRole('button', { name: '계속 입력' })).toBeNull();
});
