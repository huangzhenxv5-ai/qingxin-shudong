// 情绪成长档案聚合数据类型
import type { EmotionKey } from './emotion';
import type { Achievement } from './card';

// 情绪分布
export interface EmotionDistribution {
  emotion: EmotionKey;
  count: number;
  percentage: number;
}

// 情绪趋势点
export interface EmotionTrendPoint {
  date: string;
  score: number | null;
  emotion?: EmotionKey;
}

// 功能使用统计
export interface UsageStat {
  key: 'diary' | 'chat' | 'card' | 'dailyCard' | 'breathing';
  label: string;
  icon: string;
  count: number;
  color: string;
}

// 成长档案聚合数据
export interface GrowthProfile {
  username: string;
  registerDays: number;
  totalInteractions: number;
  diaryCount: number;
  chatCount: number;
  cardGameCount: number;
  dailyCardCount: number;
  breathingCount: number;
  emotionDistribution: EmotionDistribution[];
  emotionTrend: EmotionTrendPoint[];
  emotionCalendar: { date: string; score: number; emotion: EmotionKey }[];
  usageStats: UsageStat[];
  achievements: Achievement[];
  avgScore: number;
  streakDays: number;
}

// AI 月度小结
export interface MonthlySummary {
  content: string;
  generatedAt: number;
  period: string; // YYYY-MM
}
