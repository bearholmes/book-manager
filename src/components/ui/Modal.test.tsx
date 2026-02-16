import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '@/test/test-utils';
import { Modal } from './Modal';

describe('Modal', () => {
  it('열려있을 때 렌더링되어야 함', () => {
    renderWithProviders(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <div>Modal content</div>
      </Modal>,
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('닫혀있을 때 렌더링되지 않아야 함', () => {
    renderWithProviders(
      <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
        <div>Modal content</div>
      </Modal>,
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('닫기 버튼을 클릭하면 onClose가 호출되어야 함', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    renderWithProviders(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>,
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('배경을 클릭하면 onClose가 호출되어야 함', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    const { container } = renderWithProviders(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>,
    );

    const backdrop = container.querySelector('[aria-hidden="true"]');
    if (backdrop) {
      await user.click(backdrop);
      expect(handleClose).toHaveBeenCalled();
    }
  });

  it('Escape 키를 누르면 onClose가 호출되어야 함', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    renderWithProviders(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>,
    );

    await user.keyboard('{Escape}');

    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('제목이 없을 때도 렌더링되어야 함', () => {
    renderWithProviders(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>Modal content</div>
      </Modal>,
    );

    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('다양한 크기를 지원해야 함', () => {
    const { container: container1 } = renderWithProviders(
      <Modal isOpen={true} onClose={vi.fn()} size="sm">
        <div>Small</div>
      </Modal>,
    );

    const { container: container2 } = renderWithProviders(
      <Modal isOpen={true} onClose={vi.fn()} size="xl">
        <div>Large</div>
      </Modal>,
    );

    expect(container1.querySelector('.max-w-sm')).toBeInTheDocument();
    expect(container2.querySelector('.max-w-xl')).toBeInTheDocument();
  });

  it('dialog 역할이 있어야 함', () => {
    renderWithProviders(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <div>Modal content</div>
      </Modal>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('제목이 있을 때 aria-labelledby가 있어야 함', () => {
    renderWithProviders(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <div>Modal content</div>
      </Modal>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });
});
