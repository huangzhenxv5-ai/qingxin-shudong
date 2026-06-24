import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeOnOverlayClick?: boolean;
}

const sizeClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = 'modal-title';

  // 焦点陷阱 + Escape 关闭（统一使用 useFocusTrap）
  useFocusTrap({
    enabled: open,
    containerRef: modalRef,
    onEscape: onClose,
  });

  // 锁定背景滚动
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      {/* 遮罩 - 更深的模糊 */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{
          backgroundColor: 'rgba(28, 40, 29, 0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* 模态框 - 更精致的阴影和圆角 */}
      <div
        ref={modalRef}
        className={`relative w-full ${sizeClass[size]} rounded-3xl p-6 animate-modal-in max-h-[90vh] overflow-y-auto custom-scrollbar`}
        style={{
          backgroundColor: 'var(--color-card)',
          boxShadow: '0 24px 64px rgba(28, 40, 29, 0.18), 0 8px 24px rgba(28, 40, 29, 0.12)',
          border: '1px solid var(--color-border)',
        }}
      >
        {title && (
          <h2
            id={titleId}
            className="text-xl font-heading font-semibold mb-5 tracking-tight"
            style={{ color: 'var(--color-text)' }}
          >
            {title}
          </h2>
        )}
        {children}

        {/* 关闭按钮 */}
        <button
          type="button"
          onClick={onClose}
          className="btn-icon absolute top-4 right-4 hover:scale-110 active:scale-95"
          style={{
            color: 'var(--color-text-hint)',
            backgroundColor: 'var(--color-surface)',
          }}
          aria-label="关闭"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>,
    document.body,
  );
}
