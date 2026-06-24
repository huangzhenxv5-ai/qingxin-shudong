interface StatItem {
  key: string;
  label: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
}

interface HomeStatsCardProps {
  diaryCount: number;
  chatCount: number;
  cardGameCount: number;
}

export function HomeStatsCard({ diaryCount, chatCount, cardGameCount }: HomeStatsCardProps) {
  const STATS: StatItem[] = [
    {
      key: 'diary',
      label: '累计日记',
      value: diaryCount,
      unit: '篇',
      icon: '📔',
      color: 'var(--color-caution)',
    },
    {
      key: 'chat',
      label: '倾诉次数',
      value: chatCount,
      unit: '次',
      icon: '💬',
      color: 'var(--color-secondary)',
    },
    {
      key: 'card',
      label: '卡牌配对',
      value: cardGameCount,
      unit: '局',
      icon: '🃏',
      color: 'var(--color-primary)',
    },
  ];

  return (
    <section className="px-4 sm:px-6 mb-4 animate-fade-in-up stagger-2" aria-label="我的统计">
      <div
        className="rounded-3xl p-5 lg:p-6"
        style={{
          backgroundColor: 'var(--color-card)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold" style={{ color: 'var(--color-text)' }}>
            我的统计
          </h2>
          <span
            className="text-xs px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
            }}
          >
            📈 累计数据
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {STATS.map((stat) => (
            <div
              key={stat.key}
              className="flex flex-col items-center justify-center p-4 rounded-2xl text-center transition-all duration-300 hover:scale-[1.03]"
              style={{
                backgroundColor: 'var(--color-surface)',
              }}
              role="group"
              aria-label={`${stat.label}：${stat.value}${stat.unit}`}
            >
              <span
                className="text-2xl mb-2 w-10 h-10 flex items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${stat.color}20`,
                }}
                aria-hidden="true"
              >
                {stat.icon}
              </span>
              <div
                className="text-2xl lg:text-3xl font-heading font-bold tracking-tight"
                style={{ color: stat.color }}
              >
                {stat.value}
                <span
                  className="text-xs font-normal ml-0.5"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {stat.unit}
                </span>
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
