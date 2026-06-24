import type { Achievement } from '@/types/card';

interface AchievementListProps {
  achievements: Achievement[];
}

export function AchievementList({ achievements }: AchievementListProps) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        backgroundColor: 'var(--color-card)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* 标题 */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-base font-bold"
          style={{ color: 'var(--color-text)' }}
        >
          🏆 成就徽章
        </h3>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary-dark)',
          }}
        >
          {unlockedCount} / {achievements.length}
        </span>
      </div>

      {/* 徽章网格 - 3 列 */}
      <ul
        role="list"
        className="grid grid-cols-3 gap-2 list-none p-0 m-0"
      >
        {achievements.map((achievement) => {
          const { id, name, icon, unlocked, description } = achievement;
          return (
            <li
              key={id}
              role="listitem"
              aria-label={
                unlocked
                  ? `已解锁成就：${name}，${description}`
                  : `未解锁成就：${name}`
              }
              className="flex flex-col items-center text-center p-2 rounded-xl transition-all duration-200"
              style={{
                backgroundColor: unlocked
                  ? 'var(--color-primary-light)'
                  : 'var(--color-surface)',
                opacity: unlocked ? 1 : 0.6,
              }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center rounded-full mb-1"
                style={{
                  backgroundColor: unlocked
                    ? 'var(--color-primary)'
                    : 'var(--color-border)',
                  fontSize: '1.25rem',
                  lineHeight: 1,
                }}
                aria-hidden="true"
              >
                {unlocked ? icon : '🔒'}
              </div>
              <span
                className="text-xs font-medium leading-tight"
                style={{
                  color: unlocked
                    ? 'var(--color-text)'
                    : 'var(--color-text-hint)',
                }}
              >
                {unlocked ? name : '未解锁'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
