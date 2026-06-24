import { useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { ChartTooltip, type ChartTooltipItem } from '@/components/ui/ChartTooltip';
import { EMOTIONS, type EmotionEntry } from '@/types';
import { formatDateChinese, getWeekday, getToday } from '@/utils/date';

interface CalendarViewProps {
  entries: EmotionEntry[];
}

const WEEKDAY_HEADERS = ['日', '一', '二', '三', '四', '五', '六'];

interface DayCell {
  date: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
}

function buildMonthGrid(year: number, month: number, todayStr: string): DayCell[] {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: DayCell[] = [];
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    cells.push({ date: formatDateStr(new Date(year, month - 1, d)), day: d, inMonth: false, isToday: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDateStr(new Date(year, month, d));
    cells.push({ date: dateStr, day: d, inMonth: true, isToday: dateStr === todayStr });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: formatDateStr(new Date(year, month + 1, d)), day: d, inMonth: false, isToday: false });
  }
  return cells;
}

function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function CalendarView({ entries }: CalendarViewProps) {
  const today = getToday();
  const todayDate = new Date();
  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const entryByDate = useMemo(() => {
    const map = new Map<string, EmotionEntry>();
    entries.forEach((e) => map.set(e.date, e));
    return map;
  }, [entries]);

  const cells = useMemo(() => buildMonthGrid(viewYear, viewMonth, today), [viewYear, viewMonth, today]);
  const monthTitle = `${viewYear}年${viewMonth + 1}月`;

  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else { setViewMonth((m) => m - 1); }
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else { setViewMonth((m) => m + 1); }
  };

  const selectedEntry = selectedDate ? entryByDate.get(selectedDate) : null;

  // 构建 tooltip 数据
  const hoveredEntry = hoveredDate ? entryByDate.get(hoveredDate) : null;
  const hoveredEmotion = hoveredEntry ? EMOTIONS[hoveredEntry.emotion] : null;
  const tooltipItems: ChartTooltipItem[] = hoveredEntry && hoveredEmotion
    ? [
        {
          label: '情绪状态',
          value: hoveredEmotion.label,
          emoji: hoveredEmotion.emoji,
          color: hoveredEmotion.color,
        },
        {
          label: '情绪分数',
          value: `${hoveredEntry.score} / 5`,
        },
        {
          label: '日记内容',
          value: hoveredEntry.note ? `${hoveredEntry.note.length} 字` : '仅记录情绪',
        },
      ]
    : hoveredDate
      ? [
          {
            label: '状态',
            value: '无记录',
          },
          {
            label: '星期',
            value: getWeekday(hoveredDate),
          },
        ]
      : [];

  return (
    <Card variant="default">
      <div
        ref={containerRef}
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
          <button type="button" onClick={goPrevMonth} aria-label="上一月" className="btn-icon hover:bg-surface transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h2 className="text-lg font-bold font-heading" style={{ color: 'var(--color-text)' }} aria-live="polite">{monthTitle}</h2>
          <button type="button" onClick={goNextMonth} aria-label="下一月" className="btn-icon hover:bg-surface transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        <div role="row" className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAY_HEADERS.map((w) => (
            <div key={w} role="columnheader" className="text-center text-xs font-medium py-1" style={{ color: 'var(--color-text-hint)' }}>{w}</div>
          ))}
        </div>

        <div role="grid" aria-label="情绪日历" className="grid grid-cols-7 gap-1">
          {cells.map((cell, idx) => {
            const entry = entryByDate.get(cell.date);
            const emotion = entry ? EMOTIONS[entry.emotion] : null;
            const isHovered = hoveredDate === cell.date;
            return (
              <div key={`${cell.date}-${idx}`} role="gridcell" className="aspect-square">
                <button
                  type="button"
                  disabled={!entry}
                  onClick={() => entry && setSelectedDate(cell.date)}
                  onMouseEnter={() => setHoveredDate(cell.date)}
                  aria-label={entry ? `${cell.date}，情绪${emotion?.label}` : `${cell.date}，无日记`}
                  className="w-full h-full rounded-lg flex flex-col items-center justify-center transition-all duration-200 disabled:cursor-default"
                  style={{
                    backgroundColor: entry && emotion ? emotion.color : 'var(--color-surface)',
                    opacity: cell.inMonth ? (isHovered ? 1 : 0.9) : 0.4,
                    border: cell.isToday ? '2px solid var(--color-primary)' : '1px solid transparent',
                    cursor: entry ? 'pointer' : 'default',
                    transform: isHovered && entry ? 'scale(1.08)' : undefined,
                    boxShadow: isHovered && entry ? '0 2px 8px rgba(44, 62, 45, 0.15)' : 'none',
                  }}
                >
                  <span className="text-xs font-medium leading-none" style={{ color: entry && emotion ? '#FFFFFF' : 'var(--color-text-secondary)' }}>{cell.day}</span>
                  {entry && emotion && <span className="text-sm leading-none mt-0.5" aria-hidden="true">{emotion.emoji}</span>}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-xs" style={{ color: 'var(--color-text-hint)' }}>图例：</span>
          {Object.values(EMOTIONS).map((e) => (
            <div key={e.key} className="flex items-center gap-1">
              <span className="block w-3 h-3 rounded" style={{ backgroundColor: e.color }} aria-hidden="true" />
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{e.label}</span>
            </div>
          ))}
        </div>

        {/* 悬停预览提示 */}
        <ChartTooltip
          visible={hoveredDate !== null}
          x={mousePos.x}
          y={mousePos.y}
          containerWidth={containerSize.width}
          containerHeight={containerSize.height}
          title={hoveredDate ? formatDateChinese(hoveredDate) : ''}
          subtitle={hoveredDate ? getWeekday(hoveredDate) : ''}
          items={tooltipItems}
          accentColor={hoveredEmotion?.color}
        />
      </div>

      <Modal open={!!selectedDate} onClose={() => setSelectedDate(null)} title={selectedDate ? formatDateChinese(selectedDate) : ''} size="sm">
        {selectedDate && selectedEntry && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--color-text-hint)' }}>{getWeekday(selectedDate)}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${EMOTIONS[selectedEntry.emotion].color}22`, color: 'var(--color-text-secondary)' }}>
                {EMOTIONS[selectedEntry.emotion].emoji} {EMOTIONS[selectedEntry.emotion].label}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-hint)' }}>分数 {selectedEntry.score}/5</span>
            </div>
            {selectedEntry.note ? (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{selectedEntry.note}</p>
            ) : (
              <p className="text-sm italic" style={{ color: 'var(--color-text-hint)' }}>这一天只记录了情绪，没有写日记内容。</p>
            )}
          </div>
        )}
      </Modal>
    </Card>
  );
}
