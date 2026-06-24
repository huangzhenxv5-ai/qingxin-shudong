// 每日情绪日签类型定义
import type { EmotionKey } from './emotion';

// 日签视觉模板 ID（5 套情绪模板）
export type DailyCardTemplateId = 'happy' | 'calm' | 'sad' | 'anxious' | 'angry';

// 日签记录（存入 IndexedDB）
export interface DailyCardRecord {
  id?: number;
  username: string;
  date: string; // YYYY-MM-DD
  emotion: EmotionKey;
  quote: string; // AI 生成的治愈文案
  template: DailyCardTemplateId; // 模板 ID
  emotionLabel: string; // 情绪标签文案，如「今天是平静的一天」
  imageUrl?: string; // 生成的图片 dataURL（可选存储，默认不存以节省空间）
  createdAt: number;
}

// 日签视觉模板配置
export interface DailyCardTemplate {
  id: DailyCardTemplateId;
  name: string;
  emotion: EmotionKey;
  // 配色
  bgColorFrom: string;
  bgColorTo: string;
  accentColor: string;
  textColor: string;
  // 背景装饰风格
  decoration: 'sunlight' | 'ripple' | 'raindrop' | 'stardust' | 'wave';
  // 文案风格
  quoteStyle: string;
}

// 图片生成模型接口（预留生图模型接入）
export interface ImageGenerationRequest {
  prompt: string;
  emotion: EmotionKey;
  template: DailyCardTemplateId;
  size: { width: number; height: number };
}

export interface ImageGenerationResult {
  imageUrl: string; // dataURL 或远程 URL
  source: 'canvas' | 'model'; // 渲染来源：本地 Canvas 或生图模型
}
