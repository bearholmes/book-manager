import { cn } from '@/utils/cn';

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
 * Vue 버전의 TabBlock 포팅
 */
export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('border-b border-gray-200', className)}>
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
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
