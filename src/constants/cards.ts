import type { CardPair, CardConfig, EmotionCategory } from '@/types/card';

// 6 组情绪卡牌对（Demo 版）
export const CARD_PAIRS: CardPair[] = [
  {
    pairId: 'pair-sad',
    emotion: 'sad',
    emotionLabel: '悲伤',
    emotionEmoji: '😢',
    strategyLabel: '回忆美好瞬间',
    strategyEmoji: '🌅',
    description: '悲伤时，回忆温暖的瞬间可以慢慢融化它',
    affirmation: '悲伤总会过去的，你比想象中更坚强 💪',
    color: '#4682B4',
  },
  {
    pairId: 'pair-angry',
    emotion: 'angry',
    emotionLabel: '愤怒',
    emotionEmoji: '🔥',
    strategyLabel: '深呼吸冷静',
    strategyEmoji: '🌬️',
    description: '愤怒时，深呼吸能帮你找回内心的平静',
    affirmation: '深呼吸是平复情绪的好方法，你做得很好 🌈',
    color: '#FF6347',
  },
  {
    pairId: 'pair-anxious',
    emotion: 'anxious',
    emotionLabel: '焦虑',
    emotionEmoji: '🌀',
    strategyLabel: '列出能控制的事',
    strategyEmoji: '📋',
    description: '焦虑时，专注于你能控制的事情',
    affirmation: '专注于能控制的事，焦虑就会慢慢消散 ✨',
    color: '#9370DB',
  },
  {
    pairId: 'pair-happy',
    emotion: 'happy',
    emotionLabel: '开心',
    emotionEmoji: '😊',
    strategyLabel: '分享给朋友',
    strategyEmoji: '💌',
    description: '开心时，分享让快乐加倍',
    affirmation: '分享快乐，快乐会变成双倍 🎉',
    color: '#FFB946',
  },
  {
    pairId: 'pair-calm',
    emotion: 'calm',
    emotionLabel: '平静',
    emotionEmoji: '😌',
    strategyLabel: '享受当下',
    strategyEmoji: '🍵',
    description: '平静时，好好享受这份宁静',
    affirmation: '享受当下的宁静，这是一种力量 🍃',
    color: '#66BB6A',
  },
  {
    pairId: 'pair-fear',
    emotion: 'fear',
    emotionLabel: '害怕',
    emotionEmoji: '😨',
    strategyLabel: '寻求支持',
    strategyEmoji: '🤝',
    description: '害怕时，向信任的人寻求支持',
    affirmation: '勇敢求助是力量的体现，你并不孤单 🤗',
    color: '#78909C',
  },
];

// 从卡牌对组生成所有卡牌配置（情绪卡 + 策略卡）
export function buildCardConfigs(): CardConfig[] {
  const cards: CardConfig[] = [];
  for (const pair of CARD_PAIRS) {
    // 情绪卡
    cards.push({
      id: `${pair.pairId}-emotion`,
      pairId: pair.pairId,
      kind: 'emotion',
      emotion: pair.emotion,
      label: pair.emotionLabel,
      emoji: pair.emotionEmoji,
      description: pair.description,
      affirmation: pair.affirmation,
      color: pair.color,
    });
    // 策略卡
    cards.push({
      id: `${pair.pairId}-strategy`,
      pairId: pair.pairId,
      kind: 'strategy',
      emotion: pair.emotion,
      label: pair.strategyLabel,
      emoji: pair.strategyEmoji,
      description: pair.description,
      affirmation: pair.affirmation,
      color: pair.color,
    });
  }
  return cards;
}

// 根据情绪类型获取卡牌对组
export function getPairByEmotion(emotion: EmotionCategory): CardPair | undefined {
  return CARD_PAIRS.find((p) => p.emotion === emotion);
}

// 卡牌总数
export const TOTAL_PAIRS = CARD_PAIRS.length;
export const TOTAL_CARDS = TOTAL_PAIRS * 2;
