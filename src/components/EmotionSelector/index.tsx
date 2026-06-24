import { EMOTION_LIST, type EmotionKey } from '@/types';

interface EmotionSelectorProps {
  value: EmotionKey | null;
  intensity: number;
  onChange: (emotion: EmotionKey) => void;
  onIntensityChange: (level: number) => void;
}

const INTENSITY_LABELS = ['轻微', '适中', '强烈'];

export function EmotionSelector({
  value,
  intensity,
  onChange,
  onIntensityChange,
}: EmotionSelectorProps) {
  return (
    <div className="space-y-5">
      {/* 情绪选择网格 */}
      <div
        role="radiogroup"
        aria-label="情绪选择"
        className="grid grid-cols-3 gap-3"
      >
        {EMOTION_LIST.map((emotion) => {
          const isSelected = value === emotion.key;
          return (
            <button
              key={emotion.key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${emotion.label}${isSelected ? '，已选中' : ''}`}
              onClick={() => onChange(emotion.key)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200 focus-visible:outline-none"
              style={{
                backgroundColor: isSelected ? emotion.color : 'var(--color-surface)',
                border: `2px solid ${isSelected ? emotion.color : 'var(--color-border)'}`,
                transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                boxShadow: isSelected ? 'var(--shadow-card-hover)' : 'none',
              }}
            >
              <span className="text-3xl leading-none" aria-hidden="true">
                {emotion.emoji}
              </span>
              <span
                className="text-xs font-medium"
                style={{
                  color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                  textShadow: isSelected ? '0 1px 2px rgba(0,0,0,0.25)' : 'none',
                }}
              >
                {emotion.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 强度选择 */}
      <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            情绪强度
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-hint)' }}>
            {intensity > 0 ? INTENSITY_LABELS[intensity - 1] : '请选择'}
          </span>
        </div>
        <div
          role="radiogroup"
          aria-label="情绪强度选择"
          className="flex items-center gap-3"
        >
          {[1, 2, 3].map((level) => {
            const isActive = intensity === level;
            return (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={isActive}
                aria-label={`强度 ${level} 级 - ${INTENSITY_LABELS[level - 1]}`}
                onClick={() => onIntensityChange(level)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 focus-visible:outline-none min-h-[44px] md:min-h-[36px] whitespace-nowrap"
                style={{
                  backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                }}
              >
                <span className="flex items-center gap-1" aria-hidden="true">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <span
                      key={idx}
                      className="block rounded-full transition-all duration-200"
                      style={{
                        width: 8,
                        height: 8,
                        backgroundColor:
                          idx < level ? 'var(--color-primary)' : 'var(--color-border)',
                      }}
                    />
                  ))}
                </span>
                <span
                  className="text-xs"
                  style={{
                    color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                  }}
                >
                  {INTENSITY_LABELS[level - 1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
