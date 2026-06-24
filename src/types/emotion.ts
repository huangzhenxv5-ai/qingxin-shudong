// 情绪类型定义
export type EmotionKey = 'happy' | 'calm' | 'normal' | 'low' | 'anxious' | 'sad';

export interface EmotionConfig {
  key: EmotionKey;
  label: string;
  emoji: string;
  color: string;
  score: number;
}

// 情绪配置
export const EMOTIONS: Record<EmotionKey, EmotionConfig> = {
  happy: { key: 'happy', label: '开心', emoji: '😊', color: '#FFD93D', score: 5 },
  calm: { key: 'calm', label: '平静', emoji: '😌', color: '#6BCB77', score: 4 },
  normal: { key: 'normal', label: '一般', emoji: '😐', color: '#B0B0B0', score: 3 },
  low: { key: 'low', label: '低落', emoji: '😔', color: '#9370DB', score: 2 },
  anxious: { key: 'anxious', label: '焦虑', emoji: '😰', color: '#FF8C00', score: 1 },
  sad: { key: 'sad', label: '难过', emoji: '😢', color: '#4682B4', score: 1 },
};

export const EMOTION_LIST: EmotionConfig[] = Object.values(EMOTIONS);

// 情绪记录
export interface EmotionEntry {
  id?: number;
  username: string;
  emotion: EmotionKey;
  score: number;
  note: string;
  date: string; // YYYY-MM-DD
  createdAt: number;
}
