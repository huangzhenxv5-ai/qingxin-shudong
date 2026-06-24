import React, { type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// 全局错误边界：捕获子组件树中的渲染异常，防止整棵树崩溃导致白屏
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] 组件渲染异常：', error);
    console.error('[ErrorBoundary] 堆栈信息：', errorInfo.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      // 默认错误回退 UI
      return (
        <div
          className="min-h-screen flex items-center justify-center p-6"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          <div
            className="w-full max-w-md rounded-3xl p-8 text-center"
            style={{
              backgroundColor: 'var(--color-card)',
              boxShadow: '0 24px 64px rgba(28, 40, 29, 0.18)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5"
              style={{
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h2
              className="text-xl font-bold font-heading mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              页面出了点小问题
            </h2>
            <p
              className="text-sm mb-2 leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              部分组件加载时遇到了异常，这通常不会影响你的数据。
            </p>
            <p
              className="text-xs mb-6 p-3 rounded-xl font-mono break-all text-left"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-hint)',
                border: '1px solid var(--color-border)',
              }}
            >
              {this.state.error?.message || '未知错误'}
            </p>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 max-w-[140px] py-3 rounded-2xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(91, 138, 114, 0.25)',
                }}
              >
                重试加载
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 max-w-[140px] py-3 rounded-2xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                刷新页面
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
