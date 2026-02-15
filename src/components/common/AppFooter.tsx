export function AppFooter() {
  const appName = import.meta.env.VITE_APP_NAME || '방구석 도서관리';
  const appVersion = import.meta.env.VITE_APP_VERSION || '';

  return (
    <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-primary-100/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-center px-4 text-xs text-primary-700 sm:px-6 lg:px-8">
        <span className="font-semibold text-primary-900">{appName}</span>
        {appVersion && <span className="ml-2 text-primary-500">v{appVersion}</span>}
      </div>
    </footer>
  );
}
