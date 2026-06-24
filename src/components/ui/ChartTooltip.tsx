import { useEffect, useRef, useState } from 'react';

// 图表数据项
export interface ChartTooltipItem {
  label: string;
  value: string;
  color?: string;
  emoji?: string;
}

interface ChartTooltipProps {
  visible: boolean;
  x: number; // 鼠标 x 坐标（相对于容器）
  y: number; // 鼠标 y 坐标（相对于容器）
  containerWidth: number;
  containerHeight: number;
  title?: string;
  subtitle?: string;
  items: ChartTooltipItem[];
  accentColor?: string;
}

// 可复用的图表悬浮提示组件
// 特性：智能定位防溢出、富文本数据展示、主题适配、平滑动画、无障碍支持
export function ChartTooltip({
  visible,
  x,
  y,
  containerWidth,
  containerHeight,
  title,
  subtitle,
  items,
  accentColor,
}: ChartTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [measuredSize, setMeasuredSize] = useState({ width: 0, height: 0 });

  // 测量 tooltip 实际尺寸用于智能定位
  useEffect(() => {
    if (tooltipRef.current && visible) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setMeasuredSize({ width: rect.width, height: rect.height });
    }
  }, [visible, title, subtitle, items]);

  if (!visible) return null;

  const tooltipWidth = measuredSize.width || 160;
  const tooltipHeight = measuredSize.height || 80;
  const offset = 12;
  const edgePadding = 8;

  // 智能水平定位：优先显示在右侧，溢出时切换到左侧或居中
  let left = x + offset;
  if (left + tooltipWidth > containerWidth - edgePadding) {
    left = x - tooltipWidth - offset;
  }
  if (left < edgePadding) {
    left = Math.max(edgePadding, Math.min(x - tooltipWidth / 2, containerWidth - tooltipWidth - edgePadding));
  }

  // 智能垂直定位：优先显示在上方，溢出时切换到下方
  let top = y - tooltipHeight - offset;
  if (top < edgePadding) {
    top = y + offset;
  }
  if (top + tooltipHeight > containerHeight - edgePadding) {
    top = containerHeight - tooltipHeight - edgePadding;
  }

  return (
    <div
      ref={tooltipRef}
      role="tooltip"
      aria-hidden={!visible}
      className="chart-tooltip"
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 50,
        pointerEvents: 'none',
        animation: 'chartTooltipIn 0.18s ease-out',
      }}
    >
      {/* 标题区 */}
      {(title || subtitle) && (
        <div className="chart-tooltip-header">
          {title && <span className="chart-tooltip-title">{title}</span>}
          {subtitle && <span className="chart-tooltip-subtitle">{subtitle}</span>}
        </div>
      )}
      {/* 数据项列表 */}
      <div className="chart-tooltip-body">
        {items.map((item, idx) => (
          <div key={idx} className="chart-tooltip-row">
            <span className="chart-tooltip-label">
              {item.emoji && <span className="chart-tooltip-emoji" aria-hidden="true">{item.emoji}</span>}
              {item.color && !item.emoji && (
                <span
                  className="chart-tooltip-dot"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
              )}
              {item.label}
            </span>
            <span
              className="chart-tooltip-value"
              style={accentColor && idx === 0 ? { color: accentColor } : undefined}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
