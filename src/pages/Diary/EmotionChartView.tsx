import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { EmotionTrendChart } from '@/components/EmotionTrendChart';
import { EMOTIONS, type EmotionEntry } from '@/types';
import { getRecentDays } from '@/utils/date';

interface EmotionChartViewProps {
  entries: EmotionEntry[];
}

type Range = 7 | 30;

export function EmotionChartView({ entries }: EmotionChartViewProps) {
  const [range, setRange] = useState<Range>(7);

  // 过滤近 N 天数据
  const filteredEntries = entries.filter((e) => {
    const days = getRecentDays(range);
    return days.includes(e.date);
  });

  // 平均分
  const avgScore = filteredEntries.length > 0
    ? (filteredEntries.reduce((sum, e) => sum + e.score, 0) / filteredEntries.length).toFixed(2)
    : '0';

  return (
    <div className="space-y-3">
      <Card variant="default">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>情绪趋势</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-hint)' }}>
              平均分 {avgScore} / 5 · {filteredEntries.length} 条记录
            </p>
          </div>
          <div role="group" aria-label="时间范围切换" className="flex p-0.5 rounded-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
            {([7, 30] as Range[]).map((r) => {
              const isActive = range === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  aria-pressed={isActive}
                  aria-label={`近${r}天`}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 min-h-[44px] md:min-h-[32px] whitespace-nowrap"
                  style={{
                    backgroundColor: isActive ? 'var(--color-card)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    boxShadow: isActive ? 'var(--shadow-card)' : 'none',
                  }}
                >
                  {r}天
                </button>
              );
            })}
          </div>
        </div>

        {filteredEntries.length > 0 ? (
          <EmotionTrendChart entries={filteredEntries} days={range} height={220} />
        ) : (
          <div className="h-[220px] flex flex-col items-center justify-center" style={{ color: 'var(--color-text-hint)' }}>
            <span className="text-4xl mb-2" aria-hidden="true">📋</span>
            <p className="text-sm">近 {range} 天暂无情绪记录</p>
          </div>
        )}

        {/* Y 轴含义图例 */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          {[5, 4, 3, 2, 1].map((tick) => {
            const emotion = Object.values(EMOTIONS).find((e) => e.score === tick);
            const labels: Record<number, string> = { 1: '焦虑/难过', 2: '低落', 3: '一般', 4: '平静', 5: '开心' };
            return (
              <div key={tick} className="flex items-center gap-1">
                <span className="block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: emotion?.color ?? 'var(--color-border)' }} aria-hidden="true" />
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{tick}分 {labels[tick]}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
