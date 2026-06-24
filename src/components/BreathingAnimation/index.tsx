import { useEffect, useRef, useState } from 'react';

interface BreathingAnimationProps {
  onComplete: () => void;
  cycles?: number;
}

type Phase = 'inhale' | 'hold' | 'exhale';

// 深呼吸引导 Canvas 动画（4-4-6 呼吸法）
export function BreathingAnimation({ onComplete, cycles = 3 }: BreathingAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [countdown, setCountdown] = useState(4);
  const completedRef = useRef(false);

  const phases: { type: Phase; duration: number; label: string }[] = [
    { type: 'inhale', duration: 4, label: '吸气' },
    { type: 'hold', duration: 4, label: '屏住' },
    { type: 'exhale', duration: 6, label: '呼气' },
  ];

  useEffect(() => {
    let phaseIdx = 0;
    let cycle = 0;
    let secondsLeft = phases[0].duration;
    setPhase(phases[0].type);
    setCountdown(secondsLeft);
    setCycleCount(0);

    const timer = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft > 0) {
        setCountdown(secondsLeft);
        return;
      }

      // 进入下一阶段
      phaseIdx += 1;
      if (phaseIdx >= phases.length) {
        phaseIdx = 0;
        cycle += 1;
        setCycleCount(cycle);
        if (cycle >= cycles) {
          clearInterval(timer);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete();
          }
          return;
        }
      }
      secondsLeft = phases[phaseIdx].duration;
      setPhase(phases[phaseIdx].type);
      setCountdown(secondsLeft);
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Canvas 动画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 240;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    let animationFrame = 0;
    let startTime = Date.now();

    const render = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const cycleDuration = 14; // 4+4+6
      const cycleTime = elapsed % cycleDuration;

      // 计算缩放比例
      let scale = 1;
      let color = '#4CAF50';
      if (cycleTime < 4) {
        // 吸气：放大
        scale = 0.6 + (cycleTime / 4) * 0.4;
        color = '#4CAF50';
      } else if (cycleTime < 8) {
        // 屏住：保持
        scale = 1;
        color = '#2196F3';
      } else {
        // 呼气：缩小
        scale = 1 - ((cycleTime - 8) / 6) * 0.4;
        color = '#FF9800';
      }

      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const baseRadius = 70;
      const radius = baseRadius * scale;

      // 外圈光晕
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 1.5);
      gradient.addColorStop(0, `${color}40`);
      gradient.addColorStop(1, `${color}00`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 主圆
      ctx.fillStyle = `${color}30`;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 内圈
      ctx.fillStyle = `${color}60`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const phaseLabel = phase === 'inhale' ? '吸气' : phase === 'hold' ? '屏住' : '呼气';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <canvas ref={canvasRef} aria-hidden="true" />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          <span
            className="text-2xl font-bold"
            style={{ color: 'var(--color-text)' }}
          >
            {phaseLabel}
          </span>
          <span
            className="text-4xl font-bold mt-1"
            style={{ color: 'var(--color-primary)' }}
          >
            {countdown}
          </span>
        </div>
      </div>

      {/* 进度指示 */}
      <div className="flex items-center gap-2" aria-label={`已完成 ${cycleCount} / ${cycles} 轮`}>
        {Array.from({ length: cycles }).map((_, idx) => (
          <span
            key={idx}
            className="block w-3 h-3 rounded-full transition-all"
            style={{
              backgroundColor: idx < cycleCount ? 'var(--color-primary)' : 'var(--color-border)',
              transform: idx < cycleCount ? 'scale(1.2)' : 'scale(1)',
            }}
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        第 {Math.min(cycleCount + 1, cycles)} / {cycles} 轮
      </p>
    </div>
  );
}
