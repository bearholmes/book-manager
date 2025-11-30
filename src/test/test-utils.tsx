import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import { BrowserRouter } from 'react-router-dom';

/**
 * 테스트용 QueryClient 생성
 * 재시도와 캐싱을 비활성화하여 테스트 속도 향상
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface AllProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

/**
 * 모든 Provider를 감싸는 Wrapper 컴포넌트
 */
function AllProviders({ children, queryClient = createTestQueryClient() }: AllProvidersProps) {
  return (
    <BrowserRouter>
      <JotaiProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </JotaiProvider>
    </BrowserRouter>
  );
}

/**
 * 커스텀 render 함수
 * 모든 필요한 Provider로 컴포넌트를 감싸서 렌더링
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient },
) {
  const { queryClient, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => <AllProviders queryClient={queryClient}>{children}</AllProviders>,
    ...renderOptions,
  });
}

// re-export everything
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
