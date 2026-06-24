import { type ReactNode, createContext, useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

const typeStyles: Record<ToastType, { bg: string; color: string; icon: string }> = {
  info: { bg: 'var(--color-secondary)', color: '#FFFFFF', icon: 'ℹ️' },
  success: { bg: 'var(--color-primary)', color: '#FFFFFF', icon: '✅' },
  warning: { bg: 'var(--color-warning)', color: '#FFFFFF', icon: '⚠️' },
  error: { bg: 'var(--color-danger)', color: '#FFFFFF', icon: '❌' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 w-full max-w-sm px-4"
          role="region"
          aria-label="通知"
        >
          {toasts.map((toast) => {
            const style = typeStyles[toast.type];
            return (
              <div
                key={toast.id}
                className="rounded-xl px-4 py-3 shadow-soft-lg animate-toast-slide flex items-center gap-2"
                style={{ backgroundColor: style.bg, color: style.color }}
                role="status"
                aria-live="polite"
              >
                <span aria-hidden="true">{style.icon}</span>
                <span className="text-sm font-medium">{toast.message}</span>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
