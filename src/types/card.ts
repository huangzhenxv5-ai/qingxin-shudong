// 情绪卡牌配对游戏类型定义

// 卡牌类型：情绪卡 or 应对策略卡
export type CardKind = 'emotion' | 'strategy';

// 情绪类型
export type EmotionCategory = 'sad' | 'angry' | 'anxious' | 'happy' | 'calm' | 'fear';

// 单张卡牌配置
export interface CardConfig {
  id: string;
  pairId: string; // 配对 ID（情绪卡与策略卡共享同一 pairId）
  kind: CardKind;
  emotion: EmotionCategory;
  label: string;
  emoji: string;
  description: string;
  affirmation: string; // 配对成功时展示的正向肯定语
  color: string;
}

// 卡牌对组（一组情绪卡 + 策略卡）
export interface CardPair {
  pairId: string;
  emotion: EmotionCategory;
  emotionLabel: string;
  emotionEmoji: string;
  strategyLabel: string;
  strategyEmoji: string;
  description: string;
  affirmation: string;
  color: string;
}

// 游戏中单张卡牌的运行时状态
export interface GameCard {
  uid: string; // 运行时唯一 ID（用于列表 key）
  config: CardConfig;
  flipped: boolean;
  matched: boolean;
}

// 卡牌游戏记录（存入 IndexedDB）
export interface CardGameRecord {
  id?: number;
  username: string;
  matchedPairs: number;
  totalPairs: number;
  moves: number;
  duration: number; // 秒
  completedAt: number;
}

// 成就定义
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}
