import { useEffect, useRef, useState } from 'react';
import { EMOTIONS } from '@/types';
import { formatDateChinese, getWeekday } from '@/utils/date';
import { ChartTooltip, type ChartTooltipItem } from '@/components/ui/ChartTooltip';
import type { EmotionTrendPoint } from '@/types/growth';

interface EmotionTrendChartProps {
  data: EmotionTrendPoint[];
  height?: number;
}

// 情绪分数对应的文字描述
const SCORE_LABELS: Record<number, string> = {
  1: '焦虑/难过',
  2: '低落',
  3: '一般',
  4: '平静',
  5: '开心',
};

// 情绪趋势折线图（SVG 自绘，支持时间维度分析）- 增强版：渐变、光晕、动画、富交互
export function EmotionTrendChart({ data, height = 220 }: EmotionTrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const padding = { top: 24, right: 20, bottom: 40, left: 40 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const minScore = 1;
  const maxScore = 5;
  const yScale = (score: number) =>
    padding.top + innerHeight - ((score - minScore) / (maxScore - minScore)) * innerHeight;
  const xScale = (idx: number) =>
    padding.left + (data.length > 1 ? (idx * innerWidth) / (data.length - 1) : innerWidth / 2);

  const validPoints = data.filter(
    (p): p is EmotionTrendPoint & { score: number } => p.score !== null,
  );

  // 构建折线路径 - 平滑曲线（贝塞尔）
  const buildSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return '';
    let path = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      path += ` C${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
    }
    return path;
  };

  const validCoords = validPoints.map((p) => ({
    x: xScale(data.indexOf(p)),
    y: yScale(p.score),
  }));

  const linePath = buildSmoothPath(validCoords);

  // 渐变填充区域路径
  const areaPath =
    validCoords.length >= 2
      ? `${linePath} L${validCoords[validCoords.length - 1].x},${padding.top + innerHeight} L${validCoords[0].x},${padding.top + innerHeight} Z`
      : '';

  // X 轴标签间隔
  const labelInterval = data.length <= 7 ? 1 : Math.floor(data.length / 6);

  // 无障碍描述
  const ariaDesc = data
    .filter((p) => p.score !== null)
    .map((p) => `${formatDateChinese(p.date)}: ${p.score}分`)
    .join('，');

  // 构建 tooltip 数据
  const hoveredPoint = hoveredIdx !== null ? data[hoveredIdx] : null;
  const hoveredValid = hoveredPoint && hoveredPoint.score !== null;
  const hoveredEmotion = hoveredValid
    ? Object.values(EMOTIONS).find((e) => e.score === hoveredPoint!.score)
    : null;

  const tooltipItems: ChartTooltipItem[] = hoveredValid && hoveredPoint
    ? [
        {
          label: '情绪分数',
          value: `${hoveredPoint.score} / 5`,
          color: hoveredEmotion?.color,
        },
        {
          label: '情绪状态',
          value: SCORE_LABELS[hoveredPoint.score!] ?? '未知',
          emoji: hoveredEmotion?.emoji,
        },
        {
          label: '星期',
          value: getWeekday(hoveredPoint.date),
        },
      ]
    : [];

  return (
    <div ref={containerRef} className="w-full relative" style={{ height }}>
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={`情绪趋势图：${ariaDesc || '暂无数据'}`}
      >
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.02" />
          </linearGradient>
          <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="lineShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feFlood floodColor="var(--color-primary)" floodOpacity="0.25" />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Y 轴网格线和刻度 */}
        {[1, 2, 3, 4, 5].map((tick) => {
          const y = yScale(tick);
          const emotion = Object.values(EMOTIONS).find((e) => e.score === tick);
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="var(--color-border)"
                strokeWidth="1"
                strokeDasharray="2,4"
                opacity="0.6"
              />
              <text
                x={padding.left - 8}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="11"
                fontWeight="600"
                fill={emotion?.color ?? 'var(--color-text-hint)'}
              >
                {tick}
              </text>
              <text
                x={padding.left - 8}
                y={y + 12}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="9"
                fill="var(--color-text-hint)"
              >
                {SCORE_LABELS[tick]}
              </text>
            </g>
          );
        })}

        {/* 渐变填充区域 */}
        {areaPath && <path d={areaPath} fill="url(#trendGradient)" />}

        {/* 折线 - 带阴影 */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#lineShadow)"
          />
        )}

        {/* 悬停时的垂直辅助线 */}
        {hoveredIdx !== null && hoveredValid && (
          <line
            x1={xScale(hoveredIdx)}
            y1={padding.top}
            x2={xScale(hoveredIdx)}
            y2={padding.top + innerHeight}
            stroke="var(--color-primary)"
            strokeWidth="1"
            strokeDasharray="3,3"
            opacity="0.4"
          />
        )}

        {/* 数据点 - 带光晕和交互 */}
        {validPoints.map((p) => {
          const x = xScale(data.indexOf(p));
          const y = yScale(p.score);
          const emotion = Object.values(EMOTIONS).find((e) => e.score === p.score);
          const idx = data.indexOf(p);
          const isHovered = hoveredIdx === idx;
          return (
            <g
              key={p.date}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                if (rect) {
                  setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              {/* 扩大命中区域 */}
              <circle cx={x} cy={y} r="14" fill="transparent" />
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 7 : 5}
                fill="var(--color-card)"
                filter="url(#pointGlow)"
                style={{ transition: 'r 0.2s ease' }}
              />
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 5 : 3.5}
                fill={emotion?.color ?? 'var(--color-primary)'}
                style={{ transition: 'r 0.2s ease' }}
              />
            </g>
          );
        })}

        {/* X 轴标签 */}
        {data.map((p, idx) => {
          if (idx % labelInterval !== 0) return null;
          const x = xScale(idx);
          return (
            <text
              key={p.date}
              x={x}
              y={height - padding.bottom + 16}
              textAnchor="middle"
              fontSize="10"
              fill="var(--color-text-hint)"
            >
              {formatDateChinese(p.date)}
            </text>
          );
        })}
      </svg>

      {/* 悬停提示 */}
      <ChartTooltip
        visible={hoveredIdx !== null && !!hoveredValid}
        x={mousePos.x}
        y={mousePos.y}
        containerWidth={width}
        containerHeight={height}
        title={hoveredPoint ? formatDateChinese(hoveredPoint.date) : ''}
        subtitle={hoveredPoint ? getWeekday(hoveredPoint.date) : ''}
        items={tooltipItems}
        accentColor={hoveredEmotion?.color}
      />

      {validPoints.length === 0 && (
        <div
          className="flex items-center justify-center absolute inset-0"
        >
          <p className="text-sm" style={{ color: 'var(--color-text-hint)' }}>
            暂无情绪数据
          </p>
        </div>
      )}
    </div>
  );
}
