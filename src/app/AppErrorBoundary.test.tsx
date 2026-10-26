import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { AppErrorBoundary } from './AppErrorBoundary';

it('offers recovery after a child render fails', async () => {
  let broken = true;
  function Page() {
    if (broken) throw new Error('Synthetic render failure');
    return <p>복구된 화면</p>;
  }
  const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    render(
      <AppErrorBoundary>
        <Page />
      </AppErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('저장된 서재는 유지됩니다');
    broken = false;
    await userEvent.click(screen.getByRole('button', { name: '화면 다시 열기' }));
    expect(screen.getByText('복구된 화면')).toBeInTheDocument();
  } finally {
    errorLog.mockRestore();
  }
});
