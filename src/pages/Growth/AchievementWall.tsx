import type { Achievement } from '@/types/card';

interface AchievementWallProps {
  achievements: Achievement[];
}

// 成长徽章墙：展示所有成就，已解锁高亮，未解锁灰显
export function AchievementWall({ achievements }: AchievementWallProps) {
  const unlocked = achievements.filter((a) => a.unlocked);

  return (
    <section aria-label="成长徽章">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
          成长徽章
        </h3>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
          }}
        >
          已解锁 {unlocked.length} / {achievements.length}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="flex flex-col items-center gap-1 p-3 rounded-xl text-center transition-all"
            style={{
              backgroundColor: achievement.unlocked
                ? 'var(--color-primary-light)'
                : 'var(--color-surface)',
              border: achievement.unlocked
                ? '1px solid var(--color-primary)'
                : '1px solid var(--color-border)',
              opacity: achievement.unlocked ? 1 : 0.5,
            }}
            title={achievement.description}
          >
            <span
              className="text-3xl"
              aria-hidden="true"
              style={{ filter: achievement.unlocked ? 'none' : 'grayscale(1)' }}
            >
              {achievement.icon}
            </span>
            <span
              className="text-xs font-medium leading-tight"
              style={{ color: 'var(--color-text)' }}
            >
              {achievement.name}
            </span>
            <span
              className="text-[10px] leading-tight"
              style={{ color: 'var(--color-text-hint)' }}
            >
              {achievement.description}
            </span>
          </div>
        ))}
      </div>

      {unlocked.length === 0 && (
        <p
          className="text-center text-xs mt-3"
          style={{ color: 'var(--color-text-hint)' }}
        >
          还没有解锁徽章，多使用功能来收集吧
        </p>
      )}
    </section>
  );
}
