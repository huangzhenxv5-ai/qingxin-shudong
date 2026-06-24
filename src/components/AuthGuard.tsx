import { type ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface AuthGuardProps {
  children: ReactNode;
}

// 受保护路由守卫：未登录跳转登录页
// 关键修复：添加 loading 状态，防止 initAuth 异步执行期间误判 isAuthenticated 导致的跳转循环
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading, initAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // 初始化中：显示加载指示器，不跳转
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg)' }}
        role="status"
        aria-label="加载中"
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-2 animate-spin"
            style={{
              borderColor: 'var(--color-primary-light)',
              borderTopColor: 'var(--color-primary)',
            }}
          />
          <span className="text-sm" style={{ color: 'var(--color-text-hint)' }}>
            正在验证身份...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

// 已登录守卫：已登录用户不可访问登录/注册页
export function GuestGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // 初始化中不跳转
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg)' }}
        role="status"
        aria-label="加载中"
      >
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{
            borderColor: 'var(--color-primary-light)',
            borderTopColor: 'var(--color-primary)',
          }}
        />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
