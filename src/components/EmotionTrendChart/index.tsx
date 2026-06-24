import { useEffect, useRef, useState, useCallback } from 'react';
import { EMOTIONS } from '@/types';
import { getRecentDays, formatDateChinese, getWeekday } from '@/utils/date';
import { ChartTooltip, type ChartTooltipItem } from '@/components/ui/ChartTooltip';
import type { EmotionEntry } from '@/types';

interface EmotionTrendChartProps {
  entries: EmotionEntry[];
  days?: number;
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

interface ChartPoint {
  date: string;
  score: number | null;
  label: string;
  x: number;
  y: number;
}

// Canvas 情绪趋势图（近 N 天折线图）- 增强版：渐变填充、光晕数据点、平滑曲线、完整鼠标交互
export function EmotionTrendChart({ entries, days = 7, height = 200 }: EmotionTrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const pointsRef = useRef<ChartPoint[]>([]);

  // 监听容器宽度变化
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

  // 绘制图表
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 高分屏适配
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    // 防御：容器未就绪时跳过绘制
    if (rect.width === 0 || rect.height === 0) return;
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = height;
    const padding = { top: 24, right: 20, bottom: 36, left: 36 };
    const innerWidth = w - padding.left - padding.right;
    const innerHeight = h - padding.top - padding.bottom;

    // 清空
    ctx.clearRect(0, 0, w, h);

    // 构建数据点
    const recentDays = getRecentDays(days);
    const scoreMap = new Map<string, number>();
    entries.forEach((e) => scoreMap.set(e.date, e.score));
    const points: ChartPoint[] = recentDays.map((date, idx) => {
      const score = scoreMap.get(date) ?? null;
      const minScore = 1;
      const maxScore = 5;
      const total = recentDays.length;
      const xScale = (i: number) =>
        padding.left + (total > 1 ? (i * innerWidth) / (total - 1) : innerWidth / 2);
      const yScale = (s: number) =>
        padding.top + innerHeight - ((s - minScore) / (maxScore - minScore)) * innerHeight;
      return {
        date,
        score,
        label: formatDateChinese(date),
        x: xScale(idx),
        y: score !== null ? yScale(score) : yScale(3),
      };
    });
    pointsRef.current = points;

    const yScale = (score: number) =>
      padding.top + innerHeight - ((score - 1) / 4) * innerHeight;

    // 绘制 Y 轴网格线和刻度 - 更柔和的网格
    ctx.font = '600 10px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let tick = 1; tick <= 5; tick++) {
      const y = yScale(tick);
      ctx.strokeStyle = 'rgba(150, 160, 155, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.setLineDash([]);

      const emotion = Object.values(EMOTIONS).find((e) => e.score === tick);
      ctx.fillStyle = emotion?.color ?? '#B5B5A8';
      ctx.fillText(String(tick), padding.left - 8, y);
    }

    // 分离有数据和无数据的点
    const validPoints = points.filter((p) => p.score !== null);
    const hasGaps = points.some((p) => p.score === null);

    // 绘制无数据天的虚线占位（如果有缺口）
    if (hasGaps) {
      ctx.strokeStyle = 'rgba(150, 160, 155, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      let started = false;
      points.forEach((p) => {
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 绘制渐变填充区域 - 更丰富的渐变
    if (validPoints.length >= 2) {
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + innerHeight);
      gradient.addColorStop(0, 'rgba(91, 138, 114, 0.28)');
      gradient.addColorStop(0.5, 'rgba(91, 138, 114, 0.12)');
      gradient.addColorStop(1, 'rgba(91, 138, 114, 0.02)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      validPoints.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      // 闭合到底部
      ctx.lineTo(validPoints[validPoints.length - 1].x, padding.top + innerHeight);
      ctx.lineTo(validPoints[0].x, padding.top + innerHeight);
      ctx.closePath();
      ctx.fill();
    }

    // 绘制折线 - 带阴影的平滑线
    if (validPoints.length >= 2) {
      // 阴影
      ctx.shadowColor = 'rgba(91, 138, 114, 0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;

      ctx.strokeStyle = '#5B8A72';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      validPoints.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // 重置阴影
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }

    // 悬停时的垂直辅助线
    if (hoveredIdx !== null && points[hoveredIdx]?.score !== null) {
      const hp = points[hoveredIdx];
      ctx.strokeStyle = 'rgba(91, 138, 114, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(hp.x, padding.top);
      ctx.lineTo(hp.x, padding.top + innerHeight);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 绘制数据点 - 带光晕效果
    validPoints.forEach((p) => {
      const idx = points.indexOf(p);
      const isHovered = hoveredIdx === idx;
      const emotion = Object.values(EMOTIONS).find((e) => e.score === p.score);
      const color = emotion?.color ?? '#5B8A72';
      const radius = isHovered ? 7 : 5;
      const innerRadius = isHovered ? 5 : 3.5;

      // 悬停时额外光晕
      if (isHovered) {
        const hoverGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 16);
        hoverGlow.addColorStop(0, `${color}60`);
        hoverGlow.addColorStop(1, `${color}00`);
        ctx.fillStyle = hoverGlow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
        ctx.fill();
      }

      // 外光晕
      const glowGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10);
      glowGradient.addColorStop(0, `${color}40`);
      glowGradient.addColorStop(1, `${color}00`);
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
      ctx.fill();

      // 外圈白底
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // 内圈彩色
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, innerRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    // 绘制 X 轴标签
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#9CA39E';
    ctx.font = '400 10px "Noto Sans SC", sans-serif';
    const labelInterval = days <= 7 ? 1 : Math.floor(points.length / 6);
    points.forEach((p, idx) => {
      if (idx % labelInterval === 0) {
        ctx.fillText(p.label, p.x, h - padding.bottom + 10);
      }
    });
  }, [entries, days, height, width, hoveredIdx]);

  // 鼠标移动处理：查找最近的数据点
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setMousePos({ x: mx, y: my });

      const points = pointsRef.current;
      if (points.length === 0) return;

      // 查找最近的点（按 x 距离）
      let nearestIdx = 0;
      let minDist = Infinity;
      points.forEach((p, idx) => {
        const dist = Math.abs(p.x - mx);
        if (dist < minDist) {
          minDist = dist;
          nearestIdx = idx;
        }
      });

      // 只有当鼠标足够接近时才高亮（阈值 30px）
      if (minDist <= 30) {
        setHoveredIdx(nearestIdx);
      } else {
        setHoveredIdx(null);
      }
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredIdx(null);
  }, []);

  // 无障碍描述
  const recentDays = getRecentDays(days);
  const scoreMap = new Map<string, number>();
  entries.forEach((e) => scoreMap.set(e.date, e.score));
  const ariaDescription = recentDays
    .map((date) => {
      const score = scoreMap.get(date);
      return `${formatDateChinese(date)}: ${score ? `${score}分` : '无数据'}`;
    })
    .join('，');

  // 构建 tooltip 数据
  const hoveredPoint = hoveredIdx !== null ? pointsRef.current[hoveredIdx] : null;
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
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
        role="img"
        aria-label={`近${days}天情绪趋势图：${ariaDescription}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
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
    </div>
  );
}
