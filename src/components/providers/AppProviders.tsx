import { type ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * 应用全局 Providers 聚合
 * - ThemeProvider: 主题与无障碍设置初始化（含系统偏好监听）
 * - ToastProvider: 全局 Toast 通知
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
