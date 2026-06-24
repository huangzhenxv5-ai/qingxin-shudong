import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { recordCardGame, getGamesByUsername, getTotalGameCount } from '@/db/cardGameStore';
import { buildCardConfigs, TOTAL_PAIRS } from '@/constants/cards';
import type { GameCard } from '@/types/card';

// 洗牌算法（Fisher-Yates）
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 从卡牌配置生成运行时游戏卡牌
function createGameCards(): GameCard[] {
  const configs = buildCardConfigs();
  const shuffled = shuffle(configs);
  return shuffled.map((config, index) => ({
    uid: `card-${index}-${config.id}`,
    config,
    flipped: false,
    matched: false,
  }));
}

export interface CardGameState {
  cards: GameCard[];
  flippedUids: string[]; // 当前翻开但未配对的卡牌 uid
  matchedPairs: number;
  moves: number;
  startTime: number | null;
  isPlaying: boolean;
  isComplete: boolean;
}

const INITIAL_STATE: CardGameState = {
  cards: [],
  flippedUids: [],
  matchedPairs: 0,
  moves: 0,
  startTime: null,
  isPlaying: false,
  isComplete: false,
};

export function useCardGame() {
  const username = useAuthStore((s) => s.username);
  const [games, setGames] = useState<Awaited<ReturnType<typeof getGamesByUsername>>>([]);
  const [totalGames, setTotalGames] = useState(0);
  const [gameState, setGameState] = useState<CardGameState>(INITIAL_STATE);
  const [lastAffirmation, setLastAffirmation] = useState<string | null>(null);

  // 加载游戏记录
  const loadGames = useCallback(async () => {
    if (!username) return;
    const all = await getGamesByUsername(username);
    setGames(all);
    const total = await getTotalGameCount(username);
    setTotalGames(total);
  }, [username]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  // 开始新游戏
  const startGame = useCallback(() => {
    setGameState({
      cards: createGameCards(),
      flippedUids: [],
      matchedPairs: 0,
      moves: 0,
      startTime: Date.now(),
      isPlaying: true,
      isComplete: false,
    });
    setLastAffirmation(null);
  }, []);

  // 翻牌
  const flipCard = useCallback((uid: string) => {
    setGameState((prev) => {
      if (!prev.isPlaying || prev.isComplete) return prev;

      const card = prev.cards.find((c) => c.uid === uid);
      if (!card || card.flipped || card.matched) return prev;

      // 最多同时翻开 2 张未配对的牌
      if (prev.flippedUids.length >= 2) return prev;

      const newCards = prev.cards.map((c) =>
        c.uid === uid ? { ...c, flipped: true } : c,
      );
      const newFlippedUids = [...prev.flippedUids, uid];

      // 如果翻开了第二张，增加步数
      const newMoves = newFlippedUids.length === 2 ? prev.moves + 1 : prev.moves;

      // 如果翻开了两张，检查是否配对
      if (newFlippedUids.length === 2) {
        const [uid1, uid2] = newFlippedUids;
        const card1 = newCards.find((c) => c.uid === uid1)!;
        const card2 = newCards.find((c) => c.uid === uid2)!;

        if (card1.config.pairId === card2.config.pairId) {
          // 配对成功
          const matchedCards = newCards.map((c) =>
            c.uid === uid1 || c.uid === uid2
              ? { ...c, matched: true }
              : c,
          );
          const newMatchedPairs = prev.matchedPairs + 1;
          const complete = newMatchedPairs >= TOTAL_PAIRS;

          // 设置正向肯定语
          setLastAffirmation(card1.config.affirmation);

          // 延迟清空翻开列表
          setTimeout(() => {
            setGameState((s) => ({ ...s, flippedUids: [] }));
          }, 800);

          return {
            ...prev,
            cards: matchedCards,
            flippedUids: newFlippedUids,
            matchedPairs: newMatchedPairs,
            moves: newMoves,
            isComplete: complete,
            isPlaying: !complete,
          };
        } else {
          // 配对失败，延迟翻回
          setTimeout(() => {
            setGameState((s) => ({
              ...s,
              cards: s.cards.map((c) =>
                c.uid === uid1 || c.uid === uid2
                  ? { ...c, flipped: false }
                  : c,
              ),
              flippedUids: [],
            }));
          }, 1000);

          return {
            ...prev,
            cards: newCards,
            flippedUids: newFlippedUids,
            moves: newMoves,
          };
        }
      }

      return {
        ...prev,
        cards: newCards,
        flippedUids: newFlippedUids,
        moves: newMoves,
      };
    });
  }, []);

  // 完成游戏并记录
  const finishGame = useCallback(async () => {
    if (!username || !gameState.startTime || !gameState.isComplete) return;

    const duration = Math.floor((Date.now() - gameState.startTime) / 1000);
    await recordCardGame({
      username,
      matchedPairs: gameState.matchedPairs,
      totalPairs: TOTAL_PAIRS,
      moves: gameState.moves,
      duration,
    });

    await loadGames();
  }, [username, gameState, loadGames]);

  // 退出游戏（不记录）
  const exitGame = useCallback(() => {
    setGameState(INITIAL_STATE);
    setLastAffirmation(null);
  }, []);

  // 清除肯定语
  const clearAffirmation = useCallback(() => {
    setLastAffirmation(null);
  }, []);

  return {
    games,
    totalGames,
    gameState,
    lastAffirmation,
    startGame,
    flipCard,
    finishGame,
    exitGame,
    clearAffirmation,
    reload: loadGames,
  };
}
