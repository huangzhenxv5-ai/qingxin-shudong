import { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export function TypewriterText({ text, speed = 50, onComplete }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);

  // 始终保持最新的 onComplete 引用，避免 effect 频繁重建
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // 重置状态
    indexRef.current = 0;
    setDisplayed('');

    if (!text) {
      onCompleteRef.current?.();
      return;
    }

    // 减少动效模式：直接显示全文
    if (reducedMotion) {
      setDisplayed(text);
      indexRef.current = text.length;
      onCompleteRef.current?.();
      return;
    }

    const intervalId = window.setInterval(() => {
      indexRef.current += 1;
      const next = text.slice(0, indexRef.current);
      setDisplayed(next);

      if (indexRef.current >= text.length) {
        window.clearInterval(intervalId);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [text, speed, reducedMotion]);

  const isDone = displayed.length >= text.length;

  return (
    <span
      aria-live="polite"
      aria-label={text}
      style={{ color: 'inherit' }}
    >
      {displayed}
      <span
        className="typewriter-cursor"
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: '2px',
          marginLeft: '2px',
          backgroundColor: 'currentColor',
          height: '1em',
          verticalAlign: 'text-bottom',
          opacity: isDone ? undefined : 1,
          animation: 'typewriterBlink 1s step-end infinite',
        }}
      />
      <style>{`
        @keyframes typewriterBlink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }
        .motion-reduce .typewriter-cursor,
        @media (prefers-reduced-motion: reduce) {
          .typewriter-cursor { animation: none; opacity: 0.6; }
        }
      `}</style>
    </span>
  );
}
