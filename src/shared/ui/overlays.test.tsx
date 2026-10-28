import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { StrictMode, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastContainer } from '@/shared/notifications/components/ToastContainer';
import { toastsAtom } from '@/shared/notifications/store/toastStore';
import { Modal } from './Modal';
import { SidePanel } from './SidePanel';

afterEach(() => {
  document.body.style.overflow = '';
});

describe.each([
  ['Modal', Modal],
  ['SidePanel', SidePanel],
] as const)('%s keyboard lifecycle', (_, Overlay) => {
  it('traps Tab in both directions and restores focus when conditionally removed', async () => {
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            열기
          </button>
          {open && (
            <Overlay isOpen title="작업" onClose={() => setOpen(false)}>
              <button type="button" disabled>
                비활성
              </button>
              <input type="hidden" />
              <button type="button" hidden>
                숨김
              </button>
              <button type="button">마지막</button>
            </Overlay>
          )}
          <button type="button">배경</button>
        </>
      );
    }
    document.body.style.overflow = 'scroll';
    const user = userEvent.setup();
    render(
      <StrictMode>
        <Example />
      </StrictMode>,
    );
    const trigger = screen.getByRole('button', { name: '열기' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: '작업' });
    const close = within(dialog).getByRole('button', { name: /Close|패널 닫기/ });
    const last = within(dialog).getByRole('button', { name: '마지막' });
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(last).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    screen.getByRole('button', { name: '배경' }).focus();
    expect(close).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('scroll');
  });
});

it('closed siblings do not unlock scrolling; nested overlays only close the top one', async () => {
  const firstClose = vi.fn();
  const secondClose = vi.fn();
  function Overlays({ secondOpen }: { secondOpen: boolean }) {
    return (
      <>
        <Modal isOpen title="첫 작업" onClose={firstClose}>
          <button type="button">첫 내용</button>
        </Modal>
        <SidePanel isOpen={secondOpen} title="다음 작업" onClose={secondClose}>
          <button type="button">다음 내용</button>
        </SidePanel>
        <SidePanel isOpen={false} title="닫힌 작업" onClose={vi.fn()}>
          닫힘
        </SidePanel>
      </>
    );
  }
  const user = userEvent.setup();
  const view = render(<Overlays secondOpen />);
  const first = screen.getByRole('dialog', { name: '첫 작업' });
  const second = screen.getByRole('dialog', { name: '다음 작업' });
  expect(first.getAttribute('aria-labelledby')).not.toBe(second.getAttribute('aria-labelledby'));
  expect(first.inert).toBe(true);
  expect(document.body.style.overflow).toBe('hidden');
  await user.keyboard('{Escape}');
  expect(secondClose).toHaveBeenCalledOnce();
  expect(firstClose).not.toHaveBeenCalled();
  view.rerender(<Overlays secondOpen={false} />);
  expect(first.inert).toBe(false);
  expect(first).toContainElement(document.activeElement as HTMLElement);
  expect(document.body.style.overflow).toBe('hidden');
});

it('keeps error notifications inside the active dialog and moves them back on close', () => {
  const store = createStore();
  store.set(toastsAtom, [{ id: 'synthetic-toast', message: '저장 실패 확인', type: 'error' }]);
  function Example({ open }: { open: boolean }) {
    return (
      <Provider store={store}>
        <Modal isOpen={open} title="입력 작업" onClose={vi.fn()}>
          <button type="button">저장</button>
        </Modal>
        <ToastContainer />
      </Provider>
    );
  }
  const view = render(<Example open={false} />);
  view.rerender(<Example open />);
  expect(screen.getByRole('alert').closest('[role="dialog"]')).toBe(screen.getByRole('dialog'));
  view.rerender(<Example open={false} />);
  expect(screen.getByRole('alert').closest('[role="dialog"]')).toBeNull();
});
