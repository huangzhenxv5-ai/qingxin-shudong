import { Card } from '@/components/ui/Card';
import { EMOTIONS } from '@/types';
import type { DailyCardRecord } from '@/types/dailyCard';
import { formatDateChinese, getWeekday } from '@/utils/date';

interface DailyCardHistoryProps {
  history: DailyCardRecord[];
  onSelect?: (card: DailyCardRecord) => void;
}

// 历史日签列表：展示最近 7 天日签缩略图
export function DailyCardHistory({ history, onSelect }: DailyCardHistoryProps) {
  if (history.length === 0) {
    return (
      <Card variant="outlined" className="text-center py-10">
        <div className="text-4xl mb-2" aria-hidden="true">🎴</div>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          还没有历史日签，生成今日日签开始记录吧
        </p>
      </Card>
    );
  }

  const recent = history.slice(0, 7);

  return (
    <section aria-label="历史日签">
      <h3
        className="text-base font-bold mb-3"
        style={{ color: 'var(--color-text)' }}
      >
        历史日签
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {recent.map((card) => {
          const emotion = EMOTIONS[card.emotion];
          return (
            <Card
              key={card.id}
              variant="default"
              interactive={!!onSelect}
              onClick={onSelect ? () => onSelect(card) : undefined}
              ariaLabel={`查看 ${formatDateChinese(card.date)} 的日签`}
            >
              <div className="flex flex-col gap-2">
                <div
                  className="w-full aspect-[3/4] rounded-xl flex flex-col items-center justify-center p-3"
                  style={{
                    background: `linear-gradient(135deg, ${emotion.color}33 0%, ${emotion.color}11 100%)`,
                    border: `1px solid ${emotion.color}44`,
                  }}
                >
                  <span className="text-3xl" aria-hidden="true">{emotion.emoji}</span>
                  <p
                    className="text-xs text-center mt-2 leading-relaxed line-clamp-3"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {card.quote}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                    {formatDateChinese(card.date)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-hint)' }}>
                    {getWeekday(card.date)}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
