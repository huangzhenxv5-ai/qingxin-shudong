import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  onStart: () => void;
}

export function EmptyState({ onStart }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full px-6 py-10 text-center animate-fade-in"
      role="region"
      aria-label="开始对话引导"
    >
      {/* 装饰性 SVG 插画：树木 + 对话气泡 */}
      <div className="mb-6" aria-hidden="true">
        <svg
          width="180"
          height="160"
          viewBox="0 0 180 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 地面阴影 */}
          <ellipse cx="90" cy="148" rx="60" ry="6" fill="var(--color-border)" opacity="0.4" />

          {/* 树干 */}
          <rect x="84" y="90" width="12" height="50" rx="3" fill="#8D6E63" />
          <path
            d="M90 100 Q 86 110 88 120 Q 92 130 90 140"
            stroke="#6D4C41"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* 树冠 */}
          <circle cx="90" cy="70" r="38" fill="var(--color-primary)" opacity="0.9" />
          <circle cx="68" cy="60" r="22" fill="var(--color-primary-dark)" opacity="0.85" />
          <circle cx="112" cy="60" r="22" fill="var(--color-primary-dark)" opacity="0.85" />
          <circle cx="90" cy="48" r="20" fill="var(--color-primary)" opacity="0.95" />

          {/* 树上的小果实 */}
          <circle cx="78" cy="78" r="3" fill="var(--color-warning)" />
          <circle cx="102" cy="82" r="3" fill="var(--color-warning)" />

          {/* 对话气泡 1 */}
          <g className="animate-bounce-slow">
            <path
              d="M30 30 Q 30 18 42 18 L 70 18 Q 82 18 82 30 L 82 42 Q 82 54 70 54 L 50 54 L 42 62 L 44 54 L 42 54 Q 30 54 30 42 Z"
              fill="var(--color-card)"
              stroke="var(--color-primary)"
              strokeWidth="2"
            />
            <circle cx="44" cy="36" r="2.5" fill="var(--color-primary)" />
            <circle cx="56" cy="36" r="2.5" fill="var(--color-primary)" />
            <circle cx="68" cy="36" r="2.5" fill="var(--color-primary)" />
          </g>

          {/* 对话气泡 2 - 心形 */}
          <g transform="translate(140, 80)">
            <path
              d="M0 6 C 0 0, -8 -2, -8 4 C -8 10, 0 16, 0 16 C 0 16, 8 10, 8 4 C 8 -2, 0 0, 0 6 Z"
              fill="var(--color-warning)"
              opacity="0.85"
            />
          </g>

          {/* 飘落的小叶子 */}
          <ellipse cx="40" cy="120" rx="3" ry="6" fill="var(--color-primary-dark)" opacity="0.6" transform="rotate(30 40 120)" />
          <ellipse cx="150" cy="40" rx="3" ry="6" fill="var(--color-primary-dark)" opacity="0.6" transform="rotate(-20 150 40)" />
        </svg>
      </div>

      <h2
        className="text-xl font-bold mb-3"
        style={{ color: 'var(--color-text)' }}
      >
        欢迎来到青心树洞
      </h2>

      <p
        className="text-sm leading-relaxed mb-2 max-w-xs"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        这里是一个安全的树洞，你可以和我说说今天发生的事，分享你的开心、难过、困惑或烦恼。
      </p>

      <p
        className="text-xs mb-8 max-w-xs"
        style={{ color: 'var(--color-text-hint)' }}
      >
        我会一直在这里，温柔地听你说 🌳
      </p>

      <div className="w-full max-w-xs">
        <Button onClick={onStart} size="lg" aria-label="开始倾诉">
          <span aria-hidden="true">💬</span>
          开始倾诉
        </Button>
      </div>

      {/* 隐私提示 */}
      <p
        className="text-xs mt-6 flex items-center gap-1"
        style={{ color: 'var(--color-text-hint)' }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        你的倾诉会被安全加密保存
      </p>
    </div>
  );
}
