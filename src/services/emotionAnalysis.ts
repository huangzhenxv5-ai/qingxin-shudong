import type { EmotionStrategy } from '@/constants/prompts';

// 情绪关键词词典
const EMOTION_KEYWORDS: Record<Exclude<EmotionStrategy, 'neutral'>, string[]> = {
  sad: ['难过', '伤心', '哭', '眼泪', '心痛', '失去', '孤独', '寂寞', '没人', '不被理解', '低落', '失落', '想哭', '委屈'],
  anxious: ['紧张', '害怕', '担心', '焦虑', '考试', '压力', '失眠', '睡不着', '慌', '烦躁', '不安', '恐惧', '怕'],
  happy: ['开心', '高兴', '太好了', '成功', '做到了', '棒', '喜欢', '期待', '兴奋', '愉快', '满足'],
};

// 检测情绪：返回策略类型
export function detectEmotion(text: string): EmotionStrategy {
  const scores: Record<Exclude<EmotionStrategy, 'neutral'>, number> = {
    sad: 0,
    anxious: 0,
    happy: 0,
  };

  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    const key = emotion as Exclude<EmotionStrategy, 'neutral'>;
    for (const kw of keywords) {
      if (text.includes(kw)) {
        scores[key] += 1;
      }
    }
  }

  // 找出得分最高的情绪
  let maxScore = 0;
  let result: EmotionStrategy = 'neutral';
  for (const [emotion, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      result = emotion as EmotionStrategy;
    }
  }

  return result;
}

// 情绪策略中文描述
export const STRATEGY_LABELS: Record<EmotionStrategy, string> = {
  sad: '温暖陪伴',
  anxious: '平稳引导',
  happy: '正向强化',
  neutral: '温和倾听',
};
