import type { GameCard } from '@/types/card';

interface CardItemProps {
  card: GameCard;
  onFlip: (uid: string) => void;
  disabled: boolean;
}

export function CardItem({ card, onFlip, disabled }: CardItemProps) {
  const { config, flipped, matched } = card;
  const isFaceUp = flipped || matched;

  return (
    <button
      type="button"
      onClick={() => !disabled && !isFaceUp && onFlip(card.uid)}
      disabled={disabled || isFaceUp}
      className="card-flip-container aspect-[3/4] w-full focus-visible:outline-none"
      aria-label={
        isFaceUp
          ? `${config.kind === 'emotion' ? '情绪卡' : '策略卡'}：${config.label}`
          : '未翻开的卡牌，点击翻开'
      }
    >
      <div
        className={`card-flip-inner ${isFaceUp ? 'card-flipped' : ''} ${matched ? 'card-matched' : ''}`}
      >
        {/* 卡牌背面（未翻开时显示） */}
        <div
          className="card-face card-back rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: 'var(--color-primary)',
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 8px, transparent 8px, transparent 16px)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <span
            className="text-3xl opacity-40"
            aria-hidden="true"
          >
            🌿
          </span>
        </div>

        {/* 卡牌正面（翻开后显示） */}
        <div
          className="card-face card-front rounded-xl flex flex-col items-center justify-center p-2"
          style={{
            backgroundColor: matched
              ? `${config.color}1A`
              : 'var(--color-card)',
            border: `2px solid ${matched ? config.color : 'var(--color-border)'}`,
            boxShadow: matched ? `0 4px 12px ${config.color}44` : 'var(--shadow-card)',
          }}
        >
          <span
            className="text-3xl mb-1"
            style={{ fontSize: '2rem', lineHeight: 1 }}
            aria-hidden="true"
          >
            {config.emoji}
          </span>
          <span
            className="text-xs font-bold text-center leading-tight"
            style={{
              color: matched ? config.color : 'var(--color-text)',
            }}
          >
            {config.label}
          </span>
          <span
            className="text-[10px] mt-0.5 px-1.5 py-0.5 rounded-full"
            style={{
              backgroundColor: `${config.color}22`,
              color: config.color,
            }}
          >
            {config.kind === 'emotion' ? '情绪' : '策略'}
          </span>
          {matched && (
            <span
              className="absolute top-1 right-1 text-xs"
              aria-hidden="true"
            >
              ✓
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
