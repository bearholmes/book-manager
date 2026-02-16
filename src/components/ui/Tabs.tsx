import clsx from 'clsx';

interface Tab {
  id: string;
  name: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

/**
 * 탭 컴포넌트
 */
export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={clsx('surface-muted p-1.5', className)}>
      <nav className="grid grid-cols-2 gap-1.5" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={clsx(
              'rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
              activeTab === tab.id
                ? 'bg-white text-primary-900 shadow-soft'
                : 'text-primary-700 hover:bg-white/70 hover:text-primary-900',
            )}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
}
