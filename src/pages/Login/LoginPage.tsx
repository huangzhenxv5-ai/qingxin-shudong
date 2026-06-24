import { type FormEvent, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from || '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(username, password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex flex-col"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* 温暖治愈渐变背景 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, var(--color-primary-light) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(100, 181, 246, 0.18) 0%, transparent 45%)',
        }}
        aria-hidden="true"
      />

      {/* 装饰元素：飘浮的叶子/光点 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <span
          className="absolute top-[12%] left-[8%] text-3xl opacity-40 animate-bounce-slow"
          style={{ animationDelay: '0s' }}
        >
          🍃
        </span>
        <span
          className="absolute top-[22%] right-[10%] text-2xl opacity-30 animate-bounce-slow"
          style={{ animationDelay: '0.6s' }}
        >
          ✨
        </span>
        <span
          className="absolute bottom-[18%] left-[14%] text-2xl opacity-30 animate-bounce-slow"
          style={{ animationDelay: '1.2s' }}
        >
          🌿
        </span>
        <span
          className="absolute bottom-[28%] right-[16%] text-3xl opacity-30 animate-bounce-slow"
          style={{ animationDelay: '0.3s' }}
        >
          🌸
        </span>
      </div>

      {/* 右上角主题切换 */}
      <header className="relative z-10 flex justify-end p-4">
        <ThemeToggle />
      </header>

      {/* 主内容区 */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 pb-8">
        <div
          className="w-full max-w-md animate-slide-up relative overflow-hidden"
          style={{
            backgroundColor: 'var(--color-card)',
            borderRadius: '28px',
            boxShadow: '0 24px 64px rgba(28, 40, 29, 0.18)',
          }}
        >
          {/* 装饰性有机形态 */}
          <div
            className="absolute -top-16 -right-16 w-48 h-48 blob-shape opacity-30 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-soft), var(--color-accent-soft, rgba(212,133,107,0.18)))',
            }}
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-20 -left-12 w-40 h-40 blob-shape-2 opacity-20 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-soft), transparent)',
            }}
            aria-hidden="true"
          />

          {/* 品牌区 */}
          <div className="relative text-center pt-10 pb-6 px-6">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 animate-float"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark, #3F6B58))',
                boxShadow: '0 12px 32px rgba(91, 138, 114, 0.35)',
              }}
              aria-hidden="true"
            >
              <span className="text-4xl">🌳</span>
            </div>
            <h1
              className="text-3xl font-bold font-heading"
              style={{ color: 'var(--color-text)' }}
            >
              青心树洞
            </h1>
            <p
              className="mt-2 text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              你的情绪陪伴角落
            </p>
          </div>

          {/* 登录表单 */}
          <form
            aria-label="登录表单"
            onSubmit={handleSubmit}
            className="px-6 pb-8 space-y-4"
          >
            <Input
              label="用户名"
              type="text"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<span aria-hidden="true">👤</span>}
              autoComplete="username"
              aria-required="true"
            />

            <Input
              label="密码"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<span aria-hidden="true">🔒</span>}
              autoComplete="current-password"
              aria-required="true"
            />

            <div className="flex items-center justify-between">
              <label
                className="flex items-center gap-2 cursor-pointer text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded focus:ring-2"
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span>记住我</span>
              </label>
            </div>

            {error && (
              <div
                role="alert"
                className="p-3 rounded-xl text-sm text-center"
                style={{
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-warning)',
                }}
              >
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} fullWidth>
              {loading ? '登录中...' : '登 录'}
            </Button>

            <div
              className="text-center text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              还没有账号？{' '}
              <Link
                to="/register"
                className="btn-link inline-flex font-medium hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                立即注册
              </Link>
            </div>

            {/* 体验账号快捷登录 */}
            <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <button
                type="button"
                onClick={async () => {
                  setUsername('demo');
                  setPassword('demo123');
                  setError(null);
                  setLoading(true);
                  try {
                    await signIn('demo', 'demo123', false);
                    navigate(from, { replace: true });
                  } catch (err) {
                    setError(err instanceof Error ? err.message : '体验账号登录失败，请稍后重试');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50 min-h-[44px] whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-secondary)',
                  border: '1px dashed var(--color-border)',
                }}
              >
                🌿 使用体验账号一键登录
              </button>
              <p
                className="text-xs text-center mt-1.5"
                style={{ color: 'var(--color-text-hint)' }}
              >
                账号 demo / 密码 demo123（已预置 14 天测试数据）
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* 底部提示 */}
      <footer className="relative z-10 px-6 pb-6 text-center">
        <p
          className="text-xs"
          style={{ color: 'var(--color-text-hint)' }}
        >
          数据存储在本地浏览器，安全私密 💚
        </p>
      </footer>
    </div>
  );
}
