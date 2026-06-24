import { type AIContentItem } from './types';

/**
 * 每日内容缓存服务
 *
 * 设计要点：
 * - 按日期（YYYY-MM-DD）作为缓存 key，每日自动失效
 * - 支持增量缓存：文本生成完成后先缓存，图片生成中持续更新
 * - localStorage 不可用时静默降级
 */

const CACHE_PREFIX = 'qingxin_ai_content_v2_';
const PROGRESS_KEY = 'qingxin_ai_content_progress_v2';

/** 检测 localStorage 是否可用 */
function isStorageAvailable(): boolean {
  try {
    const testKey = '__qingxin_cache_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const storageAvailable = isStorageAvailable();

/** 生成指定日期的缓存 key */
function getCacheKey(date: string): string {
  return `${CACHE_PREFIX}${date}`;
}

/**
 * 读取指定日期的缓存内容
 *
 * @param date YYYY-MM-DD
 * @returns 缓存的内容数组，无缓存返回 null
 */
export function readDailyCache(date: string): AIContentItem[] | null {
  if (!storageAvailable) return null;
  try {
    const key = getCacheKey(date);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const items = JSON.parse(raw) as AIContentItem[];
    if (!Array.isArray(items) || items.length === 0) return null;
    return items;
  } catch {
    return null;
  }
}

/**
 * 写入指定日期的缓存内容
 *
 * 用于：
 * - 文本生成完成后立即缓存（coverUrl 为空）
 * - 每张图片生成后增量更新缓存
 */
export function writeDailyCache(date: string, items: AIContentItem[]): void {
  if (!storageAvailable) return;
  try {
    const key = getCacheKey(date);
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // 配额超限或序列化失败时静默处理
  }
}

/**
 * 增量更新单条内容的图片 URL
 *
 * 避免每次图片生成都全量序列化，仅在必要时调用
 */
export function updateItemCache(date: string, itemIndex: number, updates: Partial<AIContentItem>): void {
  if (!storageAvailable) return;
  const items = readDailyCache(date);
  if (!items || !items[itemIndex]) return;
  items[itemIndex] = { ...items[itemIndex], ...updates };
  writeDailyCache(date, items);
}

/** 清除指定日期缓存 */
export function clearDailyCache(date: string): void {
  if (!storageAvailable) return;
  try {
    localStorage.removeItem(getCacheKey(date));
  } catch {
    // 静默处理
  }
}

/** 清除所有 AI 内容缓存（含历史日期和旧版本） */
export function clearAllDailyCache(): void {
  if (!storageAvailable) return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('qingxin_ai_content') || key === PROGRESS_KEY)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // 静默处理
  }
}

/** 读取生成进度（用于跨页面/刷新恢复） */
export function readProgress(date: string): { imagesDone: number; imagesTotal: number } | null {
  if (!storageAvailable) return null;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { date: string; imagesDone: number; imagesTotal: number };
    if (data.date !== date) return null;
    return { imagesDone: data.imagesDone, imagesTotal: data.imagesTotal };
  } catch {
    return null;
  }
}

/** 写入生成进度 */
export function writeProgress(date: string, imagesDone: number, imagesTotal: number): void {
  if (!storageAvailable) return;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ date, imagesDone, imagesTotal }));
  } catch {
    // 静默处理
  }
}

/** 清除进度 */
export function clearProgress(): void {
  if (!storageAvailable) return;
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    // 静默处理
  }
}
