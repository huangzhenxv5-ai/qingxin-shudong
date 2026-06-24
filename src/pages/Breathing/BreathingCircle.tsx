import { useEffect, useRef } from 'react';
import type { BreathingState } from '@/hooks/useBreathing';

interface BreathingCircleProps {
  state: BreathingState;
  size?: number;
}

// 呼吸引导圆球动画组件
// 使用 requestAnimationFrame 根据 progress 平滑插值圆球缩放
export function BreathingCircle({ state, size = 280 }: BreathingCircleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    let rafId = 0;

    const render = () => {
      const s = stateRef.current;
      const { progress, currentPhase, bgColor, accentColor, status } = s;

      // 计算当前缩放：根据阶段类型和进度插值
      let scale = 1;
      if (status === 'idle') {
        scale = 0.85; // 待机状态：中等大小
      } else if (status === 'completed') {
        scale = 0.85;
      } else {
        // 根据阶段类型决定缩放方向
        if (currentPhase === 'inhale') {
          // 吸气：0.5 → 1.2
          scale = 0.5 + progress * 0.7;
        } else if (currentPhase === 'exhale') {
          // 呼气：1.2 → 0.5
          scale = 1.2 - progress * 0.7;
        } else if (currentPhase === 'hold') {
          // 屏息（吸气后）：保持 1.2，轻微脉动
          scale = 1.2 + Math.sin(Date.now() / 200) * 0.02;
        } else if (currentPhase === 'hold-after-exhale') {
          // 屏息（呼气后）：保持 0.5，轻微脉动
          scale = 0.5 + Math.sin(Date.now() / 200) * 0.02;
        }
      }

      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const baseRadius = size * 0.28;
      const radius = Math.max(10, baseRadius * scale);

      // 外圈光晕（径向渐变）
      const haloGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.4,
        centerX,
        centerY,
        radius * 1.8,
      );
      haloGradient.addColorStop(0, hexWithAlpha(bgColor, 0.35));
      haloGradient.addColorStop(0.6, hexWithAlpha(bgColor, 0.12));
      haloGradient.addColorStop(1, hexWithAlpha(bgColor, 0));
      ctx.fillStyle = haloGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // 主圆（半透明填充 + 描边）
      const mainGradient = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        radius * 0.1,
        centerX,
        centerY,
        radius,
      );
      mainGradient.addColorStop(0, hexWithAlpha(bgColor, 0.6));
      mainGradient.addColorStop(1, hexWithAlpha(accentColor, 0.4));
      ctx.fillStyle = mainGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // 内圈装饰
      ctx.fillStyle = hexWithAlpha('#FFFFFF', 0.25);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.55, 0, Math.PI * 2);
      ctx.fill();

      // 中心小圆点
      ctx.fillStyle = hexWithAlpha('#FFFFFF', 0.6);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.12, 0, Math.PI * 2);
      ctx.fill();

      rafId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(rafId);
  }, [size]);

  const { phaseLabel, remainingSeconds, currentRound, rounds, status } = state;
  const showCountdown = status === 'running' || status === 'paused';

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <canvas ref={canvasRef} aria-hidden="true" />

      {/* 中心文字层 */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        role="status"
        aria-live="polite"
        aria-label={
          showCountdown
            ? `${phaseLabel}，剩余 ${remainingSeconds} 秒，第 ${currentRound} 轮共 ${rounds} 轮`
            : status === 'completed'
              ? '练习完成'
              : '准备开始呼吸练习'
        }
      >
        {showCountdown ? (
          <>
            <span
              className="text-2xl font-bold"
              style={{ color: '#FFFFFF', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            >
              {phaseLabel}
            </span>
            <span
              className="text-5xl font-bold mt-2"
              style={{ color: '#FFFFFF', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            >
              {remainingSeconds}
            </span>
            <span
              className="text-xs mt-2 opacity-80"
              style={{ color: '#FFFFFF' }}
            >
              第 {Math.min(currentRound, rounds)} / {rounds} 轮
            </span>
          </>
        ) : status === 'completed' ? (
          <>
            <span className="text-4xl" aria-hidden="true">✨</span>
            <span
              className="text-lg font-bold mt-2"
              style={{ color: 'var(--color-text)' }}
            >
              练习完成
            </span>
          </>
        ) : (
          <>
            <span className="text-5xl" aria-hidden="true">🌬️</span>
            <span
              className="text-sm mt-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              点击开始按钮
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// 将 hex 颜色转为带 alpha 的 rgba
function hexWithAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
