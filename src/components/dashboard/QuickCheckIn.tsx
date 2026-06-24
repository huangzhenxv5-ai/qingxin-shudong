import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EMOTION_LIST, EMOTIONS, type EmotionKey } from '@/types';

interface QuickCheckInProps {
  todayEntry?: { emotion: EmotionKey; note: string } | null;
  onCheckIn?: (emotion: EmotionKey) => void;
}

export function QuickCheckIn({ todayEntry, onCheckIn }: QuickCheckInProps) {
  const [selected, setSelected] = useState<EmotionKey | null>(todayEntry?.emotion ?? null);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (key: EmotionKey) => {
    setSelected(key);
    setShowFeedback(true);
    onCheckIn?.(key);
    setTimeout(() => setShowFeedback(false), 2000);
  };

  const selectedEmotion = selected ? EMOTION_LIST.find((e) => e.key === selected) : null;
  const hasCheckedIn = !!todayEntry;

  return (
    <section className="px-4 sm:px-6 mb-4 animate-fade-in-up stagger-1" aria-label="今日情绪打卡">
      <div
        className="rounded-3xl p-5 lg:p-6"
        style={{
          backgroundColor: 'var(--color-card)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-heading font-semibold" style={{ color: 'var(--color-text)' }}>
              今日情绪打卡
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-hint)' }}>
              选一个最贴近此刻心情的表情
            </p>
          </div>
          {hasCheckedIn ? (
            <span
              className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary-dark)',
              }}
            >
              ✓ 已打卡
            </span>
          ) : (
            <span
              className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{
                backgroundColor: 'var(--color-accent-light)',
                color: 'var(--color-accent-dark)',
              }}
            >
              待打卡
            </span>
          )}
        </div>

        <div
          className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3"
          role="group"
          aria-label="情绪选择"
        >
          {EMOTION_LIST.map((emotion) => {
            const isSelected = selected === emotion.key;
            return (
              <button
                key={emotion.key}
                type="button"
                onClick={() => handleSelect(emotion.key)}
                aria-label={`选择${emotion.label}情绪`}
                aria-pressed={isSelected}
                className="group flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300 focus-visible:outline-none"
                style={{
                  backgroundColor: isSelected
                    ? `${EMOTIONS[emotion.key].color}25`
                    : 'var(--color-surface)',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  border: isSelected
                    ? `2px solid ${EMOTIONS[emotion.key].color}`
                    : '2px solid transparent',
                }}
              >
                <span
                  className="text-2xl sm:text-3xl transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                >
                  {emotion.emoji}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{
                    color: isSelected ? 'var(--color-text)' : 'var(--color-text-secondary)',
                  }}
                >
                  {emotion.label}
                </span>
              </button>
            );
          })}
        </div>

        {showFeedback && selectedEmotion && (
          <div
            className="mt-4 p-4 rounded-2xl text-center animate-scale-in"
            style={{
              backgroundColor: `${EMOTIONS[selectedEmotion.key].color}15`,
              border: `1px solid ${EMOTIONS[selectedEmotion.key].color}40`,
            }}
            role="status"
            aria-live="polite"
          >
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              已记录今日心情：{selectedEmotion.emoji} {selectedEmotion.label}
            </p>
            <p
              className="mt-1 text-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              感谢你的分享，每一种感受都值得被看见 💚
            </p>
          </div>
        )}

        {hasCheckedIn && todayEntry?.note && (
          <div
            className="mt-3 p-3.5 rounded-2xl text-sm"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span style={{ color: EMOTIONS[todayEntry.emotion].color }}>
              {EMOTIONS[todayEntry.emotion].emoji}
            </span>
            {' '}
            {todayEntry.note}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate('/diary')}
          className="mt-4 w-full py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] min-h-[44px] whitespace-nowrap"
          style={{
            color: 'var(--color-primary-dark)',
            backgroundColor: 'var(--color-primary-light)',
          }}
        >
          查看全部日记 →
        </button>
      </div>
    </section>
  );
}
