import { useEffect, useRef } from 'react';

interface UseFocusTrapOptions {
  /** 是否启用焦点陷阱 */
  enabled: boolean;
  /** 容器引用 */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Escape 键回调 */
  onEscape?: () => void;
  /** 是否自动聚焦第一个可聚焦元素，默认 true */
  autoFocus?: boolean;
  /** 是否在关闭后恢复之前的焦点，默认 true */
  restoreFocus?: boolean;
  /** 自定义可聚焦元素选择器 */
  focusableSelector?: string;
}

const DEFAULT_FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * 统一的焦点陷阱 Hook，封装 Escape 关闭、Tab 焦点循环、自动聚焦与焦点恢复逻辑。
 * 适用于模态框、抽屉、全屏覆盖层等需要捕获焦点的覆盖型组件。
 */
export function useFocusTrap({
  enabled,
  containerRef,
  onEscape,
  autoFocus = true,
  restoreFocus = true,
  focusableSelector = DEFAULT_FOCUSABLE_SELECTOR,
}: UseFocusTrapOptions) {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    // 记录之前的焦点元素，便于关闭后恢复
    previousActiveElement.current = document.activeElement as HTMLElement | null;

    const getFocusableElements = (): HTMLElement[] =>
      Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter(
        (el) =>
          !el.hasAttribute('disabled') &&
          el.getAttribute('aria-hidden') !== 'true',
      );

    // 自动聚焦第一个可聚焦元素
    if (autoFocus) {
      setTimeout(() => {
        getFocusableElements()[0]?.focus();
      }, 50);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape 关闭
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      // Tab 焦点陷阱
      if (e.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // 恢复之前的焦点
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [enabled, containerRef, onEscape, autoFocus, restoreFocus, focusableSelector]);
}
