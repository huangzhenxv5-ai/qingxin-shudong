import { useState } from 'react';
import { EMOTIONS, type EmotionKey } from '@/types';
import { ChartTooltip, type ChartTooltipItem } from '@/components/ui/ChartTooltip';
import type { EmotionDistribution } from '@/types/growth';

interface EmotionRadarChartProps {
  data: EmotionDistribution[];
  size?: number;
}

// 情绪雷达图（6 维情绪分布，SVG 自绘）- 增强版：渐变填充、光晕数据点、悬停交互
export function EmotionRadarChart({ data, size = 240 }: EmotionRadarChartProps) {
  const [hoveredEmotion, setHoveredEmotion] = useState<EmotionKey | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const center = size / 2;
  const radius = size / 2 - 40;
  const dimensions: EmotionKey[] = ['happy', 'calm', 'normal', 'low', 'anxious', 'sad'];
  const angleStep = (Math.PI * 2) / dimensions.length;

  // 最大值用于归一化
  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const countMap = new Map<EmotionKey, number>();
  const pctMap = new Map<EmotionKey, number>();
  data.forEach((d) => {
    countMap.set(d.emotion, d.count);
    pctMap.set(d.emotion, d.percentage);
  });

  // 计算每个维度的点坐标
  const points = dimensions.map((emotion, idx) => {
    const count = countMap.get(emotion) || 0;
    const ratio = count / maxCount;
    const angle = idx * angleStep - Math.PI / 2;
    return {
      emotion,
      x: center + radius * ratio * Math.cos(angle),
      y: center + radius * ratio * Math.sin(angle),
      count,
      percentage: pctMap.get(emotion) || 0,
      labelX: center + (radius + 20) * Math.cos(angle),
      labelY: center + (radius + 20) * Math.sin(angle),
      angle,
    };
  });

  // 数据多边形路径
  const polygonPath = points.map((p) => `${p.x},${p.y}`).join(' ');

  // 网格圈
  const gridLevels = [0.25, 0.5, 0.75, 1];

  // 无障碍描述
  const ariaDesc = dimensions
    .map((e) => `${EMOTIONS[e].label}: ${countMap.get(e) || 0}次`)
    .join('，');

  // 构建 tooltip 数据
  const hoveredPoint = hoveredEmotion ? points.find((p) => p.emotion === hoveredEmotion) : null;
  const tooltipItems: ChartTooltipItem[] = hoveredPoint
    ? [
        {
          label: '记录次数',
          value: `${hoveredPoint.count} 次`,
          color: EMOTIONS[hoveredPoint.emotion].color,
        },
        {
          label: '占比',
          value: `${hoveredPoint.percentage}%`,
        },
        {
          label: '情绪分数',
          value: `${EMOTIONS[hoveredPoint.emotion].score} / 5`,
        },
      ]
    : [];

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        role="img"
        aria-label={`情绪雷达图：${ariaDesc}`}
        className="mx-auto"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        onMouseLeave={() => setHoveredEmotion(null)}
      >
        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.15" />
          </radialGradient>
          <filter id="radarPointGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 网格多边形 - 更柔和 */}
        {gridLevels.map((level) => {
          const gridPoints = dimensions
            .map((_, idx) => {
              const angle = idx * angleStep - Math.PI / 2;
              const x = center + radius * level * Math.cos(angle);
              const y = center + radius * level * Math.sin(angle);
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <polygon
              key={level}
              points={gridPoints}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="1"
              opacity="0.5"
            />
          );
        })}

        {/* 轴线 */}
        {dimensions.map((_, idx) => {
          const angle = idx * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={idx}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="var(--color-border)"
              strokeWidth="1"
              opacity="0.4"
            />
          );
        })}

        {/* 数据多边形 - 渐变填充 */}
        {polygonPath && (
          <polygon
            points={polygonPath}
            fill="url(#radarGradient)"
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}

        {/* 数据点 - 带光晕和交互 */}
        {points.map((p) => {
          const isHovered = hoveredEmotion === p.emotion;
          return (
            <g
              key={p.emotion}
              onMouseEnter={() => setHoveredEmotion(p.emotion)}
              style={{ cursor: 'pointer' }}
            >
              {/* 扩大命中区域 */}
              <circle cx={p.x} cy={p.y} r="16" fill="transparent" />
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 7 : 5}
                fill={EMOTIONS[p.emotion].color}
                stroke="var(--color-card)"
                strokeWidth="2"
                filter="url(#radarPointGlow)"
                style={{ transition: 'r 0.2s ease' }}
              />
            </g>
          );
        })}

        {/* 维度标签 */}
        {points.map((p) => {
          const isHovered = hoveredEmotion === p.emotion;
          return (
            <g
              key={p.emotion}
              onMouseEnter={() => setHoveredEmotion(p.emotion)}
              style={{ cursor: 'pointer' }}
            >
              <text
                x={p.labelX}
                y={p.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isHovered ? 18 : 16}
                style={{ transition: 'font-size 0.2s ease' }}
              >
                {EMOTIONS[p.emotion].emoji}
              </text>
              <text
                x={p.labelX}
                y={p.labelY + 15}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fill={isHovered ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
                fontWeight={isHovered ? 700 : 500}
                style={{ transition: 'fill 0.2s ease, font-weight 0.2s ease' }}
              >
                {EMOTIONS[p.emotion].label}
              </text>
            </g>
          );
        })}
      </svg>

      <ChartTooltip
        visible={hoveredPoint !== null}
        x={mousePos.x}
        y={mousePos.y}
        containerWidth={size}
        containerHeight={size}
        title={hoveredPoint ? `${EMOTIONS[hoveredPoint.emotion].emoji} ${EMOTIONS[hoveredPoint.emotion].label}` : ''}
        subtitle={hoveredPoint ? `共 ${totalCount} 条记录` : ''}
        items={tooltipItems}
        accentColor={hoveredPoint ? EMOTIONS[hoveredPoint.emotion].color : undefined}
      />
    </div>
  );
}

// 情绪占比环形图（SVG 自绘）- 增强版：间隙分隔、中心信息、悬停交互
export function EmotionDonutChart({ data, size = 180 }: { data: EmotionDistribution[]; size?: number }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const center = size / 2;
  const outerRadius = size / 2 - 10;
  const innerRadius = outerRadius * 0.62;
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <p className="text-sm" style={{ color: 'var(--color-text-hint)' }}>暂无数据</p>
      </div>
    );
  }

  let currentAngle = -Math.PI / 2;
  const segments = data.map((d, idx) => {
    const angle = (d.count / total) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // 留出 2 度的间隙
    const gap = 0.015;
    const adjustedStart = startAngle + gap;
    const adjustedEnd = endAngle - gap;

    const isHovered = hoveredIdx === idx;
    const hoverOffset = isHovered ? 6 : 0;
    const midAngle = (adjustedStart + adjustedEnd) / 2;
    const offsetX = hoverOffset * Math.cos(midAngle);
    const offsetY = hoverOffset * Math.sin(midAngle);

    const x1 = center + offsetX + outerRadius * Math.cos(adjustedStart);
    const y1 = center + offsetY + outerRadius * Math.sin(adjustedStart);
    const x2 = center + offsetX + outerRadius * Math.cos(adjustedEnd);
    const y2 = center + offsetY + outerRadius * Math.sin(adjustedEnd);
    const x3 = center + offsetX + innerRadius * Math.cos(adjustedEnd);
    const y3 = center + offsetY + innerRadius * Math.sin(adjustedEnd);
    const x4 = center + offsetX + innerRadius * Math.cos(adjustedStart);
    const y4 = center + offsetY + innerRadius * Math.sin(adjustedStart);

    const largeArc = angle > Math.PI ? 1 : 0;

    const path = [
      `M${x1},${y1}`,
      `A${outerRadius},${outerRadius} 0 ${largeArc} 1 ${x2},${y2}`,
      `L${x3},${y3}`,
      `A${innerRadius},${innerRadius} 0 ${largeArc} 0 ${x4},${y4}`,
      'Z',
    ].join(' ');

    return {
      path,
      color: EMOTIONS[d.emotion].color,
      label: EMOTIONS[d.emotion].label,
      emoji: EMOTIONS[d.emotion].emoji,
      percentage: d.percentage,
      count: d.count,
      score: EMOTIONS[d.emotion].score,
      idx,
    };
  });

  // 构建 tooltip 数据
  const hoveredSeg = hoveredIdx !== null ? segments[hoveredIdx] : null;
  const tooltipItems: ChartTooltipItem[] = hoveredSeg
    ? [
        {
          label: '记录次数',
          value: `${hoveredSeg.count} 次`,
          color: hoveredSeg.color,
        },
        {
          label: '占比',
          value: `${hoveredSeg.percentage}%`,
        },
        {
          label: '情绪分数',
          value: `${hoveredSeg.score} / 5`,
        },
      ]
    : [];

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        role="img"
        aria-label={`情绪占比环形图：${segments.map((s) => `${s.label} ${s.percentage}%`).join('，')}`}
        className="mx-auto"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <defs>
          <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="0" dy="1" result="offsetblur" />
            <feFlood floodColor="rgba(0,0,0,0.1)" />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {segments.map((seg) => (
          <path
            key={seg.idx}
            d={seg.path}
            fill={seg.color}
            stroke="var(--color-card)"
            strokeWidth="1"
            filter="url(#donutShadow)"
            onMouseEnter={() => setHoveredIdx(seg.idx)}
            style={{
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              opacity: hoveredIdx === null || hoveredIdx === seg.idx ? 1 : 0.5,
            }}
          />
        ))}

        {/* 中心信息 */}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="24"
          fontWeight="700"
          fill="var(--color-text)"
          fontFamily="var(--font-heading, 'Noto Serif SC', serif)"
        >
          {hoveredSeg ? hoveredSeg.count : total}
        </text>
        <text
          x={center}
          y={center + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill="var(--color-text-secondary)"
          fontWeight="500"
        >
          {hoveredSeg ? `${hoveredSeg.label}次数` : '总记录'}
        </text>
      </svg>

      <ChartTooltip
        visible={hoveredSeg !== null}
        x={mousePos.x}
        y={mousePos.y}
        containerWidth={size}
        containerHeight={size}
        title={hoveredSeg ? `${hoveredSeg.emoji} ${hoveredSeg.label}` : ''}
        subtitle={hoveredSeg ? `共 ${total} 条记录` : ''}
        items={tooltipItems}
        accentColor={hoveredSeg?.color}
      />
    </div>
  );
}
