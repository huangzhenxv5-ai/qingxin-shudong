 import { type AIContentItem, type ProgressListener } from './types';
import { generateDailyContent, getTodayDate } from './aiContentGenerator';
import {
  readDailyCache,
  writeDailyCache,
  clearAllDailyCache,
  clearDailyCache,
  clearProgress,
  writeProgress,
} from './cache';

/**
 * 正向内容板块 - AI 生成内容服务
 *
 * 职责：
 * 1. 每日生成 30+ 条 AI 内容（文本 + 封面图 + 文章配图）
 * 2. 按日期缓存，每日自动更新
 * 3. 支持进度监听（文本生成 → 图片生成）
 * 4. 失败降级：缓存优先，无缓存时实时生成
 */

export { getTodayDate } from './aiContentGenerator';
export { CATEGORY_META, ALL_CATEGORIES } from './categories';
export { clearAllDailyCache, clearDailyCache } from './cache';
export type * from './types';

/**
 * 获取指定日期的内容
 *
 * 流程：
 * 1. 优先读取当日缓存（可能文本已就绪但图片仍在生成）
 * 2. 无缓存时调用 AI 生成
 * 3. 生成过程中通过 onProgress 上报进度
 * 4. 文本生成完成后立即写入缓存，图片每张完成后增量更新
 */
export async function fetchDailyContent(
  date: string = getTodayDate(),
  onProgress?: ProgressListener,
  forceRefresh: boolean = false,
): Promise<AIContentItem[]> {
  // 1. 非强制刷新时优先读缓存
  if (!forceRefresh) {
    const cached = readDailyCache(date);
    if (cached && cached.length > 0) {
      // 缓存完整性校验：必须同时包含短句和文章，否则视为不完整
      const hasArticles = cached.some((item) => item.form === 'article');
      const hasQuotes = cached.some((item) => item.form === 'quote');

      if (hasArticles && hasQuotes) {
        // 缓存命中：检查是否所有图片都已生成
        const allImagesReady = cached.every(
          (item) => item.coverUrl && (!item.illustrations.length || item.illustrations.every((i) => i.url)),
        );
        if (allImagesReady) {
          onProgress?.({
            phase: 'done',
            textReady: true,
            imagesDone: cached.length,
            imagesTotal: cached.length,
          });
          return cached;
        }
        // 图片未全部就绪：返回缓存内容，前端可先展示文本
        onProgress?.({
          phase: 'done',
          textReady: true,
          imagesDone: cached.filter((i) => i.coverUrl).length,
          imagesTotal: cached.length,
        });
        return cached;
      }

      // 缓存不完整（缺少文章或短句）：清除并重新生成
      console.warn('[内容缓存] 缓存不完整，缺少文章或短句，重新生成', {
        hasArticles,
        hasQuotes,
        total: cached.length,
      });
      clearDailyCache(date);
    }
  }

  // 2. 无缓存或强制刷新：调用 AI 生成
  const progressWrapper: ProgressListener = (progress) => {
    // 文本就绪后立即写入缓存
    if (progress.textReady && progress.imagesTotal === 0) {
      // 文本生成完成，但还未开始图片生成，此时 items 尚未返回
      // 实际缓存写入在 generateDailyContent 返回后
    }
    // 图片生成进度持久化
    if (progress.phase === 'images') {
      writeProgress(date, progress.imagesDone, progress.imagesTotal);
    }
    onProgress?.(progress);
  };

  const items = await generateDailyContent(date, progressWrapper);

  // 3. 写入缓存（仅在结果完整时缓存，避免不完整数据被反复读取）
  const hasArticles = items.some((item) => item.form === 'article');
  const hasQuotes = items.some((item) => item.form === 'quote');
  if (hasArticles && hasQuotes) {
    writeDailyCache(date, items);
  } else {
    console.warn('[内容缓存] 生成结果不完整，暂不缓存', {
      hasArticles,
      hasQuotes,
      total: items.length,
    });
  }
  clearProgress();

  return items;
}

/**
 * 重新生成今日内容（强制刷新）
 */
export async function refreshDailyContent(
  date: string = getTodayDate(),
  onProgress?: ProgressListener,
): Promise<AIContentItem[]> {
  clearDailyCache(date);
  clearProgress();
  return fetchDailyContent(date, onProgress, true);
}

/** 清除所有缓存（用于设置页重置） */
export function resetContentService(): void {
  clearAllDailyCache();
  clearProgress();
}
