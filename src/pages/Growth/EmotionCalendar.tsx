import { useRef, useState } from 'react';
import { EMOTIONS, EMOTION_LIST, type EmotionKey } from '@/types';
import { formatDateChinese, getWeekday, formatDate } from '@/utils/date';
import { ChartTooltip, type ChartTooltipItem } from '@/components/ui/ChartTooltip';

interface EmotionCalendarProps {
  data: { date: string; score: number; emotion: EmotionKey }[];
}

interface DayCell {
  day: number;
  date: string;
  hasData: boolean;
  emotion?: EmotionKey;
  score?: number;
}

// 情绪日历热力图：月度日历视图，每天颜色代表情绪 - 增强版：圆角、阴影、今日高亮、自定义 tooltip
export function EmotionCalendar({ data }: EmotionCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // 当月天数
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // 当月第一天是星期几（0=周日）
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // 构建数据映射
  const dataMap = new Map<string, { score: number; emotion: EmotionKey }>();
  data.forEach((d) => dataMap.set(d.date, { score: d.score, emotion: d.emotion }));

  const monthLabel = `${year}年${month + 1}月`;
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const todayStr = formatDate(new Date());

  // 构建日历单元格
  const cells: (DayCell | null)[] = [];
  // 前置空格
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = dataMap.get(dateStr);
    cells.push({
      day,
      date: dateStr,
      hasData: !!dayData,
      emotion: dayData?.emotion,
      score: dayData?.score,
    });
  }

  const monthData = data.filter((d) =>
    d.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`),
  );
  const ariaDesc = monthData
    .map((d) => `${formatDateChinese(d.date)}: ${EMOTIONS[d.emotion].label}`)
    .join('，');

  // 构建 tooltip 数据
  const hoveredCell = hoveredDate ? cells.find((c) => c?.date === hoveredDate) : null;
  const hoveredEmotion = hoveredCell?.emotion ? EMOTIONS[hoveredCell.emotion] : null;
  const tooltipItems: ChartTooltipItem[] = hoveredCell
    ? hoveredCell.hasData && hoveredEmotion
      ? [
          {
            label: '情绪状态',
            value: hoveredEmotion.label,
            emoji: hoveredEmotion.emoji,
            color: hoveredEmotion.color,
          },
          {
            label: '情绪分数',
            value: `${hoveredCell.score} / 5`,
          },
          {
            label: '星期',
            value: getWeekday(hoveredCell.date),
          },
        ]
      : [
          {
            label: '状态',
            value: '无记录',
          },
          {
            label: '星期',
            value: getWeekday(hoveredCell.date),
          },
        ]
    : [];

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`情绪日历热力图：${ariaDesc || '本月暂无记录'}`}
      className="relative"
      onMouseMove={(e) => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          setContainerSize({ width: rect.width, height: rect.height });
        }
      }}
      onMouseLeave={() => setHoveredDate(null)}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-heading font-semibold" style={{ color: 'var(--color-text)' }}>
          {monthLabel}
        </p>
        <div className="flex items-center gap-1.5">
          {EMOTION_LIST.slice(0, 5).map((e) => (
            <div key={e.key} className="flex items-center gap-1">
              <span
                className="block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: e.color }}
                aria-hidden="true"
              />
            </div>
          ))}
          <span className="text-xs ml-1" style={{ color: 'var(--color-text-hint)' }}>
            情绪色
          </span>
        </div>
      </div>

      {/* 星期表头 */}
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {weekdays.map((wd) => (
          <div
            key={wd}
            className="text-center text-xs font-medium py-1.5"
            style={{ color: 'var(--color-text-hint)' }}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, idx) => {
          if (cell === null) {
            return <div key={`empty-${idx}`} />;
          }
          const emotion = cell.emotion ? EMOTIONS[cell.emotion] : null;
          const isToday = cell.date === todayStr;
          const isHovered = hoveredDate === cell.date;
          return (
            <div
              key={cell.date}
              className="aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: emotion ? `${emotion.color}30` : 'var(--color-surface)',
                border: isToday
                  ? '2px solid var(--color-primary)'
                  : emotion
                    ? `1px solid ${emotion.color}55`
                    : '1px solid var(--color-border)',
                boxShadow: isToday
                  ? '0 0 0 3px var(--color-primary-light)'
                  : isHovered
                    ? '0 2px 8px rgba(44, 62, 45, 0.12)'
                    : 'none',
                transform: isHovered ? 'scale(1.08)' : undefined,
              }}
              onMouseEnter={() => setHoveredDate(cell.date)}
            >
              <span
                className="font-medium"
                style={{
                  color: isToday ? 'var(--color-primary-dark)' : 'var(--color-text)',
                  fontWeight: isToday ? 700 : 500,
                }}
              >
                {cell.day}
              </span>
              {emotion && (
                <span className="text-sm leading-none mt-0.5" aria-hidden="true">
                  {emotion.emoji}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {monthData.length === 0 && (
        <p
          className="text-center text-xs mt-4"
          style={{ color: 'var(--color-text-hint)' }}
        >
          本月还没有情绪记录，去情绪日记打卡吧
        </p>
      )}

      {/* 自定义悬浮提示 */}
      <ChartTooltip
        visible={hoveredCell !== null}
        x={mousePos.x}
        y={mousePos.y}
        containerWidth={containerSize.width}
        containerHeight={containerSize.height}
        title={hoveredCell ? formatDateChinese(hoveredCell.date) : ''}
        subtitle={hoveredCell ? getWeekday(hoveredCell.date) : ''}
        items={tooltipItems}
        accentColor={hoveredEmotion?.color}
      />
    </div>
  );
}
