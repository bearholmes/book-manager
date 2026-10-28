import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { BookForm } from './BookForm';

vi.mock('../hooks/useCoverImage', () => ({ useCoverImage: () => undefined }));
afterEach(() => vi.unstubAllGlobals());

it('does not save a stale cover when a suggestion is applied during confirmation', async () => {
  vi.stubGlobal('URL', { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} });
  let accept!: (value: boolean) => void;
  const beforeSubmit = vi.fn(
    () =>
      new Promise<boolean>((resolve) => {
        accept = resolve;
      }),
  );
  const onSubmit = vi.fn();
  const image = { data: 'aGVsbG8=', mimeType: 'image/jpeg' as const };
  render(
    <BookForm
      onCancel={() => {}}
      onSubmit={onSubmit}
      beforeSubmit={beforeSubmit}
      renderIsbnHelper={(context) => (
        <button type="button" onClick={() => context.apply({}, image)}>
          표지만 반영
        </button>
      )}
    />,
  );
  fireEvent.change(screen.getByRole('textbox', { name: /도서명/ }), {
    target: { value: '테스트' },
  });
  fireEvent.click(screen.getByRole('button', { name: '추가' }));
  await waitFor(() => expect(beforeSubmit).toHaveBeenCalledOnce());
  fireEvent.click(screen.getByRole('button', { name: '표지만 반영' }));
  await act(async () => accept(true));
  expect(onSubmit).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: '추가' }));
  await waitFor(() => expect(beforeSubmit).toHaveBeenCalledTimes(2));
  await act(async () => accept(true));
  expect(onSubmit.mock.calls[0]?.[0].cover).toEqual(image);
});
