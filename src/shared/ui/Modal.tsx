import clsx from 'clsx';
import { X } from 'lucide-react';
import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';
import overlay from './Overlay.module.css';
import { useOverlay } from './useOverlay';

interface ModalProps {
  /** 모달 열림/닫힘 상태 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 모달 제목 */
  title?: string;
  /** 모달 내용 */
  children: React.ReactNode;
  /** 모달 크기 */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** 추가 CSS 클래스 */
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

/**
 * 모달 컴포넌트
 *
 * 키보드 포커스와 배경 접근을 관리하는 모달입니다.
 * - Escape 키로 닫기
 * - 포커스 트래핑 (모달 내부에서만 Tab 이동)
 * - 포커스 복원 (모달 닫을 때 원래 위치로 포커스 복귀)
 *
 * @example
 * ```tsx
 * <Modal isOpen={isOpen} onClose={onClose} title="도서 상세">
 *   <p>도서 정보...</p>
 * </Modal>
 * ```
 */
export function Modal({ isOpen, onClose, title, children, size = 'md', className }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useOverlay(isOpen, modalRef, onClose);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={modalRef}
      tabIndex={-1}
      className={clsx(overlay.root, 'overflow-y-auto')}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : '대화상자'}
      // biome-ignore lint/a11y/useSemanticElements: Portalled overlay shares focus, inert background and scroll lifecycle with SidePanel.
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <button
        type="button"
        tabIndex={-1}
        className={clsx(overlay.backdrop, 'fixed inset-0 transition-opacity')}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className={clsx(styles.panel, sizeClasses[size], className)}>
          {/* Header */}
          {title && (
            <div className={styles.header}>
              <h3 className={styles.title} id={titleId}>
                {title}
              </h3>
              <button type="button" onClick={onClose} className={styles.close}>
                <span className="sr-only">Close</span>
                <X className="h-6 w-6" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
