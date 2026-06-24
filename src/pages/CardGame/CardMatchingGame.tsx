import { useEffect, useState } from 'react';
import { CardItem } from './CardItem';
import { useCardGame } from '@/hooks/useCardGame';
import { TOTAL_PAIRS } from '@/constants/cards';

interface CardMatchingGameProps {
  game: ReturnType<typeof useCardGame>;
}

export function CardMatchingGame({ game }: CardMatchingGameProps) {
  const { gameState, flipCard, lastAffirmation, clearAffirmation } = game;
  const [elapsedTime, setElapsedTime] = useState(0);

  // 计时器
  useEffect(() => {
    if (!gameState.isPlaying || !gameState.startTime) return;
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - gameState.startTime!) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState.isPlaying, gameState.startTime]);

  // 游戏完成时重置计时器显示
  useEffect(() => {
    if (gameState.isComplete && gameState.startTime) {
      setElapsedTime(Math.floor((Date.now() - gameState.startTime) / 1000));
    }
  }, [gameState.isComplete, gameState.startTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const disabled = gameState.flippedUids.length >= 2;

  return (
    <div className="space-y-4">
      {/* 游戏状态栏 */}
      <div
        className="flex items-center justify-around rounded-xl p-3"
        style={{
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div className="text-center">
          <p
            className="text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            配对进度
          </p>
          <p
            className="text-lg font-bold"
            style={{ color: 'var(--color-primary)' }}
          >
            {gameState.matchedPairs} / {TOTAL_PAIRS}
          </p>
        </div>
        <div
          className="w-px h-8"
          style={{ backgroundColor: 'var(--color-border)' }}
        />
        <div className="text-center">
          <p
            className="text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            步数
          </p>
          <p
            className="text-lg font-bold"
            style={{ color: 'var(--color-text)' }}
          >
            {gameState.moves}
          </p>
        </div>
        <div
          className="w-px h-8"
          style={{ backgroundColor: 'var(--color-border)' }}
        />
        <div className="text-center">
          <p
            className="text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            用时
          </p>
          <p
            className="text-lg font-bold tabular-nums"
            style={{ color: 'var(--color-text)' }}
          >
            {formatTime(elapsedTime)}
          </p>
        </div>
      </div>

      {/* 配对成功提示 */}
      {lastAffirmation && (
        <div
          className="rounded-xl p-3 text-center text-sm font-medium animate-fade-in"
          style={{
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary-dark)',
          }}
          role="status"
          aria-live="polite"
          onClick={clearAffirmation}
        >
          ✨ {lastAffirmation}
        </div>
      )}

      {/* 卡牌网格 */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto">
        {gameState.cards.map((card) => (
          <CardItem
            key={card.uid}
            card={card}
            onFlip={flipCard}
            disabled={disabled}
          />
        ))}
      </div>

      {/* 玩法提示 */}
      <div
        className="rounded-xl p-3 text-xs text-center"
        style={{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-secondary)',
        }}
      >
        💡 翻开两张卡牌，将「情绪卡」与对应的「应对策略卡」配对成功即可消除
      </div>
    </div>
  );
}
