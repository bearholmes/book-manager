/**
 * AppFooter 컴포넌트를 렌더링합니다.
 */
export function AppFooter() {
  const appVersion = __APP_VERSION__;

  return (
    <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-primary-100/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-center px-4 text-xs text-primary-700 sm:px-6 lg:px-8">
        <span className="font-semibold text-primary-900">방구석 도서관리</span>
        {appVersion && <span className="ml-2 text-primary-500">v{appVersion}</span>}
      </div>
    </footer>
  );
}
