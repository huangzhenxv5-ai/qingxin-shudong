import { useRef, useState } from 'react';
import { ChartTooltip, type ChartTooltipItem } from '@/components/ui/ChartTooltip';
import type { UsageStat } from '@/types/growth';

interface UsageStatsProps {
  data: UsageStat[];
}

// 功能使用统计柱状图 - 增强版：悬停交互、占比展示、排名信息
export function UsageStats({ data }: UsageStatsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const barHeight = 28;
  const labelWidth = 80;
  const valueWidth = 40;

  // 按次数排序生成排名
  const sortedByCount = [...data].sort((a, b) => b.count - a.count);
  const rankMap = new Map<string, number>();
  sortedByCount.forEach((d, idx) => rankMap.set(d.key, idx + 1));

  // 构建 tooltip 数据
  const hoveredStat = hoveredKey ? data.find((d) => d.key === hoveredKey) : null;
  const tooltipItems: ChartTooltipItem[] = hoveredStat
    ? [
        {
          label: '使用次数',
          value: `${hoveredStat.count} 次`,
          color: hoveredStat.color,
        },
        {
          label: '使用占比',
          value: totalCount > 0 ? `${((hoveredStat.count / totalCount) * 100).toFixed(1)}%` : '0%',
        },
        {
          label: '使用排名',
          value: `第 ${rankMap.get(hoveredStat.key)} / ${data.length} 位`,
        },
      ]
    : [];

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`功能使用统计：${data.map((d) => `${d.label} ${d.count}次`).join('，')}`}
      className="relative"
      onMouseMove={(e) => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          setContainerSize({ width: rect.width, height: rect.height });
        }
      }}
      onMouseLeave={() => setHoveredKey(null)}
    >
      <div className="space-y-3">
        {data.map((stat) => {
          const widthRatio = stat.count / maxCount;
          const isHovered = hoveredKey === stat.key;
          return (
            <div
              key={stat.key}
              className="flex items-center gap-3 transition-all duration-200"
              style={{
                transform: isHovered ? 'translateX(4px)' : undefined,
              }}
              onMouseEnter={() => setHoveredKey(stat.key)}
            >
              <div className="flex items-center gap-2" style={{ width: labelWidth }}>
                <span className="text-lg" aria-hidden="true">{stat.icon}</span>
                <span
                  className="text-xs font-medium"
                  style={{
                    color: isHovered ? 'var(--color-text)' : 'var(--color-text-secondary)',
                    fontWeight: isHovered ? 600 : 500,
                  }}
                >
                  {stat.label}
                </span>
              </div>
              <div
                className="flex-1 rounded-full overflow-hidden transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  height: barHeight,
                  boxShadow: isHovered ? '0 2px 8px rgba(44, 62, 45, 0.1)' : 'none',
                }}
              >
                <div
                  className="h-full rounded-full flex items-center justify-end pr-2"
                  style={{
                    width: `${(widthRatio * 100).toFixed(0)}%`,
                    minWidth: stat.count > 0 ? '24px' : '0',
                    backgroundColor: stat.color,
                    filter: isHovered ? 'brightness(1.15)' : 'none',
                    transition: 'filter 0.2s ease',
                  }}
                >
                  {stat.count > 0 && (
                    <span className="text-xs font-bold text-white">{stat.count}</span>
                  )}
                </div>
              </div>
              <span
                className="text-xs transition-colors duration-200"
                style={{
                  color: isHovered ? 'var(--color-text)' : 'var(--color-text-hint)',
                  width: valueWidth,
                  textAlign: 'right',
                  fontWeight: isHovered ? 600 : 400,
                }}
              >
                {stat.count > 0 ? `${stat.count} 次` : '未使用'}
              </span>
            </div>
          );
        })}
      </div>

      <ChartTooltip
        visible={hoveredStat !== null}
        x={mousePos.x}
        y={mousePos.y}
        containerWidth={containerSize.width}
        containerHeight={containerSize.height}
        title={hoveredStat ? `${hoveredStat.icon} ${hoveredStat.label}` : ''}
        subtitle={hoveredStat ? `总互动 ${totalCount} 次` : ''}
        items={tooltipItems}
        accentColor={hoveredStat?.color}
      />
    </div>
  );
}
