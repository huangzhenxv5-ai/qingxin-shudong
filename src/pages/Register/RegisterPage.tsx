import { type FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, validateUsername, validatePassword } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
}

function calcPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: '请输入密码', color: 'var(--color-border)' };

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[a-zA-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  const map: Record<number, { label: string; color: string }> = {
    0: { label: '太弱', color: 'var(--color-danger)' },
    1: { label: '较弱', color: 'var(--color-warning)' },
    2: { label: '一般', color: 'var(--color-caution)' },
    3: { label: '较强', color: 'var(--color-secondary)' },
    4: { label: '很强', color: 'var(--color-primary)' },
  };
  const item = map[score] ?? map[0];
  return { score, label: item.label, color: item.color };
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string; confirm?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = calcPasswordStrength(password);
  const strengthPercent = (strength.score / 4) * 100;

  const validateForm = () => {
    const newErrors: typeof errors = {};
    const usernameError = validateUsername(username);
    if (usernameError) newErrors.username = usernameError;
    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;
    if (confirmPassword !== password) newErrors.confirm = '两次输入的密码不一致';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(username, password);
      navigate('/', { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '注册失败，请重试');
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

      {/* 装饰元素 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <span
          className="absolute top-[12%] left-[8%] text-3xl opacity-40 animate-bounce-slow"
          style={{ animationDelay: '0s' }}
        >
          🌱
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
          className="w-full max-w-md animate-slide-up"
          style={{
            backgroundColor: 'var(--color-card)',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-card-hover)',
          }}
        >
          {/* 品牌区 */}
          <div className="text-center pt-10 pb-6 px-6">
            <div className="text-6xl mb-4 animate-bounce-slow" aria-hidden="true">
              🌱
            </div>
            <h1
              className="text-3xl font-bold"
              style={{ color: 'var(--color-text)' }}
            >
              创建账号
            </h1>
            <p
              className="mt-2 text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              开启你的情绪陪伴之旅
            </p>
          </div>

          {/* 注册表单 */}
          <form
            aria-label="注册表单"
            onSubmit={handleSubmit}
            className="px-6 pb-8 space-y-4"
          >
            <Input
              label="用户名"
              type="text"
              placeholder="3-16 位字母、数字或下划线"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              icon={<span aria-hidden="true">👤</span>}
              autoComplete="username"
              aria-required="true"
            />

            <div>
              <Input
                label="密码"
                type="password"
                placeholder="6-20 位，需含字母和数字"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                icon={<span aria-hidden="true">🔒</span>}
                autoComplete="new-password"
                aria-required="true"
                aria-describedby="password-strength"
              />

              {/* 密码强度指示器 */}
              {password && (
                <div className="mt-2" id="password-strength">
                  <div
                    className="h-1.5 w-full rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--color-border)' }}
                  >
                    <div
                      role="progressbar"
                      aria-label="密码强度"
                      aria-valuenow={strength.score}
                      aria-valuemin={0}
                      aria-valuemax={4}
                      aria-valuetext={strength.label}
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${strengthPercent}%`,
                        backgroundColor: strength.color,
                      }}
                    />
                  </div>
                  <p
                    className="mt-1 text-xs"
                    style={{ color: strength.color }}
                  >
                    密码强度：{strength.label}
                  </p>
                </div>
              )}
            </div>

            <Input
              label="确认密码"
              type="password"
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirm}
              icon={<span aria-hidden="true">🔒</span>}
              autoComplete="new-password"
              aria-required="true"
            />

            {submitError && (
              <div
                role="alert"
                className="p-3 rounded-xl text-sm text-center"
                style={{
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-warning)',
                }}
              >
                {submitError}
              </div>
            )}

            <Button type="submit" loading={loading} fullWidth>
              {loading ? '注册中...' : '注 册'}
            </Button>

            <div
              className="text-center text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              已有账号？{' '}
              <Link
                to="/login"
                className="btn-link inline-flex font-medium hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                返回登录
              </Link>
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
          密码使用 bcrypt 加密存储，安全可靠 🔒
        </p>
      </footer>
    </div>
  );
}
