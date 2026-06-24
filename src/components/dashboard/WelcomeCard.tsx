import { useAuthStore } from '@/stores/authStore';
import { getToday, getWeekday } from '@/utils/date';

export function WelcomeCard() {
  const username = useAuthStore((state) => state.username);
  const hour = new Date().getHours();

  const greeting = hour < 6 ? '夜深了' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';
  const subGreeting = hour < 6 ? '注意休息哦' : hour < 12 ? '新的一天开始了' : hour < 18 ? '今天过得怎么样' : '辛苦一天啦';

  const today = getToday();
  const weekday = getWeekday(today);
  const dateLabel = `${today.replace(/-/g, '/')} ${weekday}`;

  return (
    <section
      className="px-4 sm:px-6 pt-6 pb-4 animate-fade-in-up"
      aria-label="欢迎卡片"
    >
      <div
        className="rounded-3xl p-6 lg:p-8 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-card) 60%, var(--color-accent-light) 120%)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* 装饰有机形状 */}
        <div
          className="absolute -top-12 -right-8 w-40 h-40 opacity-25 pointer-events-none blob-shape"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-soft) 100%)',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-16 -left-10 w-32 h-32 opacity-15 pointer-events-none blob-shape-2"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-secondary) 100%)',
          }}
          aria-hidden="true"
        />
        {/* 微光点缀 */}
        <div
          className="absolute top-6 right-12 w-2 h-2 rounded-full opacity-40 animate-pulse-soft"
          style={{ backgroundColor: 'var(--color-accent)' }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-10 right-24 w-1.5 h-1.5 rounded-full opacity-30 animate-pulse-soft"
          style={{ backgroundColor: 'var(--color-primary)', animationDelay: '0.5s' }}
          aria-hidden="true"
        />

        {/* 移动端：纵向；桌面端：横向 */}
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-medium tracking-wider uppercase mb-1"
              style={{ color: 'var(--color-primary-dark)', opacity: 0.7 }}
            >
              {dateLabel}
            </p>
            <h2
              className="text-2xl lg:text-4xl font-heading font-bold tracking-tight"
              style={{ color: 'var(--color-text)' }}
              aria-live="polite"
            >
              {greeting}，{username || '朋友'}
            </h2>
            <p
              className="mt-2 text-sm lg:text-base"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {subGreeting}，今天感觉怎么样？
            </p>
          </div>

          <div className="flex items-center gap-3 lg:flex-col lg:items-end lg:gap-2">
            <div
              className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center text-4xl lg:text-5xl animate-float"
              style={{
                background: 'linear-gradient(135deg, var(--color-card) 0%, var(--color-primary-light) 100%)',
                boxShadow: 'var(--shadow-soft)',
              }}
              aria-hidden="true"
            >
              🌳
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
