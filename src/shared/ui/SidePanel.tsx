import clsx from 'clsx';
import { X } from 'lucide-react';
import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import overlay from './Overlay.module.css';
import styles from './SidePanel.module.css';
import { useOverlay } from './useOverlay';

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
 */
export function SidePanel({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  className,
}: SidePanelProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useOverlay(isOpen, rootRef, onClose);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={rootRef}
      tabIndex={-1}
      className={clsx(overlay.root, 'overflow-hidden')}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : '사이드 패널'}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 overflow-hidden">
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className={clsx(overlay.backdrop, 'absolute inset-0')}
          onClick={onClose}
        />

        <div
          className={clsx(
            'fixed inset-y-0 flex max-w-full',
            position === 'right' ? 'right-0 pl-10' : 'left-0 pr-10',
          )}
        >
          <div
            className={clsx(
              styles.panel,
              position === 'right' ? 'translate-x-0' : '-translate-x-0',
              className,
            )}
          >
            <div className="flex h-full flex-col overflow-y-scroll border-l border-line-subtle/70 bg-surface shadow-panel">
              {/* Header */}
              {title && (
                <div className="border-b border-line-subtle px-6 py-6 sm:px-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-8 text-copy-heading" id={titleId}>
                      {title}
                    </h2>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg p-1 text-copy-subtle hover:bg-surface-selected hover:text-copy-heading focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      <span className="sr-only">패널 닫기</span>
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="relative flex-1 px-6 py-8 sm:px-8">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
