import { EmotionTrendChart } from '@/components/EmotionTrendChart';
import type { EmotionEntry } from '@/types';

interface TrendCardProps {
  entries: EmotionEntry[];
  days?: number;
}

export function TrendCard({ entries, days = 7 }: TrendCardProps) {
  const hasData = entries.length > 0;

  return (
    <section className="px-4 sm:px-6 mb-4 animate-fade-in-up stagger-3" aria-label={`近 ${days} 天情绪趋势`}>
      <div
        className="rounded-3xl p-5 lg:p-6"
        style={{
          backgroundColor: 'var(--color-card)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-heading font-semibold" style={{ color: 'var(--color-text)' }}>
              近 {days} 天情绪趋势
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-hint)' }}>
              看见情绪的起伏变化
            </p>
          </div>
          <span
            className="text-xs px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: hasData ? 'var(--color-primary-light)' : 'var(--color-surface)',
              color: hasData ? 'var(--color-primary-dark)' : 'var(--color-text-hint)',
            }}
          >
            {hasData ? `📊 ${entries.length} 条` : '暂无数据'}
          </span>
        </div>

        {hasData ? (
          <EmotionTrendChart entries={entries} days={days} height={200} />
        ) : (
          <div
            className="h-[200px] flex flex-col items-center justify-center"
            style={{ color: 'var(--color-text-hint)' }}
          >
            <span className="text-4xl mb-2 opacity-50" aria-hidden="true">📋</span>
            <p className="text-sm">还没有情绪记录，去打卡吧</p>
          </div>
        )}
      </div>
    </section>
  );
}
