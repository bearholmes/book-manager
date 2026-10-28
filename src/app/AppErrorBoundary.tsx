import { Component, type ReactNode } from 'react';
import { Button } from '@/shared/ui/Button';

/** Keep a renderer failure recoverable without exposing book data in the error message. */
export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="mx-auto max-w-lg space-y-4 p-8">
          <h1 className="text-xl font-semibold">화면을 표시하지 못했습니다</h1>
          <p role="alert">저장된 서재는 유지됩니다. 화면을 다시 열어주세요.</p>
          <Button onClick={() => this.setState({ failed: false })}>화면 다시 열기</Button>
        </main>
      );
    }
    return this.props.children;
  }
}
