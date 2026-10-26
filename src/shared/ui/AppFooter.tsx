/**
 * AppFooter 컴포넌트를 렌더링합니다.
 */
export function AppFooter() {
  const appVersion = __APP_VERSION__;

  return (
    <footer className="fixed inset-x-0 bottom-0 z-footer border-t border-line-subtle/80 bg-surface/90 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-center px-4 text-xs text-copy-secondary sm:px-6 lg:px-8">
        <span className="font-semibold text-copy-heading">방구석 도서관리</span>
        {appVersion && <span className="ml-2 text-copy-subtle">v{appVersion}</span>}
      </div>
    </footer>
  );
}
