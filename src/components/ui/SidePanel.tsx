import { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  className?: string;
}

/**
 * 사이드 패널 컴포넌트
 * Vue 버전의 SidePopNew/SidePopEdit 포팅
 */
export function SidePanel({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  className,
}: SidePanelProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      aria-labelledby="slide-over-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-primary-950/45 backdrop-blur-[2px]" onClick={onClose} />

        <div
          className={clsx(
            'fixed inset-y-0 flex max-w-full',
            position === 'right' ? 'right-0 pl-10' : 'left-0 pr-10',
          )}
        >
          <div
            className={clsx(
              'animate-in-right relative w-screen max-w-md transform transition ease-in-out duration-300',
              position === 'right' ? 'translate-x-0' : '-translate-x-0',
              className,
            )}
          >
            <div className="flex h-full flex-col overflow-y-scroll border-l border-primary-100/70 bg-paper-50 shadow-panel">
              {/* Header */}
              {title && (
                <div className="border-b border-primary-100/90 bg-white/90 px-4 py-6 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-primary-900" id="slide-over-title">
                      {title}
                    </h2>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg p-1 text-primary-500 hover:bg-primary-100 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <span className="sr-only">Close panel</span>
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="relative flex-1 px-4 py-6 sm:px-6">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
