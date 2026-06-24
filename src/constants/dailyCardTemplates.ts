import type { DailyCardTemplate, DailyCardTemplateId } from '@/types/dailyCard';
import type { EmotionKey } from '@/types/emotion';

// 5 套情绪日签视觉模板
export const DAILY_CARD_TEMPLATES: Record<DailyCardTemplateId, DailyCardTemplate> = {
  happy: {
    id: 'happy',
    name: '暖阳',
    emotion: 'happy',
    bgColorFrom: '#FFF3B0',
    bgColorTo: '#FFB347',
    accentColor: '#FF8C42',
    textColor: '#5C3A00',
    decoration: 'sunlight',
    quoteStyle: '活力鼓励',
  },
  calm: {
    id: 'calm',
    name: '薄荷',
    emotion: 'calm',
    bgColorFrom: '#D4F1E0',
    bgColorTo: '#A8E6CF',
    accentColor: '#66BB6A',
    textColor: '#1B4D2B',
    decoration: 'ripple',
    quoteStyle: '宁静治愈',
  },
  sad: {
    id: 'sad',
    name: '雨后',
    emotion: 'sad',
    bgColorFrom: '#D6E4F0',
    bgColorTo: '#B0C4DE',
    accentColor: '#6B8FB5',
    textColor: '#2C3E50',
    decoration: 'raindrop',
    quoteStyle: '温柔安慰',
  },
  anxious: {
    id: 'anxious',
    name: '星夜',
    emotion: 'anxious',
    bgColorFrom: '#E6D9F5',
    bgColorTo: '#C3AED6',
    accentColor: '#9370DB',
    textColor: '#3D2A5C',
    decoration: 'stardust',
    quoteStyle: '安定力量',
  },
  angry: {
    id: 'angry',
    name: '暖夕',
    emotion: 'normal',
    bgColorFrom: '#FFE0E0',
    bgColorTo: '#FFB39C',
    accentColor: '#FF6B6B',
    textColor: '#5C1A1A',
    decoration: 'wave',
    quoteStyle: '理解释放',
  },
};

// 模板列表
export const DAILY_CARD_TEMPLATE_LIST: DailyCardTemplate[] = Object.values(DAILY_CARD_TEMPLATES);

// 根据情绪类型获取对应模板
export function getTemplateByEmotion(emotion: EmotionKey): DailyCardTemplate {
  const map: Record<EmotionKey, DailyCardTemplateId> = {
    happy: 'happy',
    calm: 'calm',
    normal: 'angry',
    low: 'sad',
    anxious: 'anxious',
    sad: 'sad',
  };
  return DAILY_CARD_TEMPLATES[map[emotion]];
}

// 情绪标签文案
export function getEmotionLabel(emotion: EmotionKey): string {
  const labels: Record<EmotionKey, string> = {
    happy: '今天是充满阳光的一天',
    calm: '今天是平静温柔的一天',
    normal: '今天是平淡安稳的一天',
    low: '今天是有些低落的一天',
    anxious: '今天是有些紧张的一天',
    sad: '今天是有些难过的一天',
  };
  return labels[emotion];
}
