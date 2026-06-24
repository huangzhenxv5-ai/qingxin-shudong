import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  upsertDailyCard,
  getTodayDailyCard,
  getAllDailyCardsByUsername,
  getRecentDailyCards,
} from '@/db/dailyCardStore';
import {
  generateDailyQuote,
  renderDailyCardCanvas,
  generateDailyCardImage,
  downloadDailyCard,
  shareDailyCard,
  type CanvasRenderOptions,
} from '@/services/dailyCard';
import { getTemplateByEmotion, getEmotionLabel } from '@/constants/dailyCardTemplates';
import type { DailyCardRecord, DailyCardTemplateId } from '@/types/dailyCard';
import type { EmotionKey } from '@/types/emotion';
import { getToday } from '@/utils/date';

export function useDailyCard() {
  const username = useAuthStore((s) => s.username);
  const [todayCard, setTodayCard] = useState<DailyCardRecord | null>(null);
  const [history, setHistory] = useState<DailyCardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  const [currentTemplate, setCurrentTemplate] = useState<DailyCardTemplateId | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionKey | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [imageSource, setImageSource] = useState<'model' | 'canvas' | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 加载今日日签 + 历史
  const loadCards = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    try {
      const [today, all] = await Promise.all([
        getTodayDailyCard(username),
        getAllDailyCardsByUsername(username),
      ]);
      setTodayCard(today ?? null);
      setHistory(all);
      if (today) {
        setCurrentQuote(today.quote);
        setCurrentTemplate(today.template);
        setCurrentEmotion(today.emotion);
      }
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // 创建离屏 Canvas（不依赖 DOM，用于生图模型 + Canvas 渲染）
  const createOffscreenCanvas = useCallback((): HTMLCanvasElement => {
    return document.createElement('canvas');
  }, []);

  // 纯 Canvas 渲染日签（无生图模型，用于切换模板等快速操作）
  const renderLocally = useCallback(
    (options: CanvasRenderOptions): string => {
      const canvas = createOffscreenCanvas();
      return renderDailyCardCanvas(canvas, options);
    },
    [createOffscreenCanvas],
  );

  // 生成日签（AI 文案 + 生图模型背景图 + Canvas 叠加文字）
  const generateCard = useCallback(
    async (emotion: EmotionKey, note?: string, nickname?: string) => {
      if (!username) return;
      setGenerating(true);
      setCurrentEmotion(emotion);

      // 取消上一次生成
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // 1. AI 生成文案
        const quote = await generateDailyQuote(emotion, note, controller.signal);
        if (controller.signal.aborted) return;
        setCurrentQuote(quote);

        // 2. 确定模板
        const template = getTemplateByEmotion(emotion);
        setCurrentTemplate(template.id);

        // 3. 生成图片（生图模型生成背景图 + Canvas 叠加文字）
        const renderOptions: CanvasRenderOptions = {
          date: getToday(),
          emotion,
          quote,
          templateId: template.id,
          nickname,
        };
        // 使用离屏 Canvas，canvasRenderer 签名：(req, bgImage?) => dataURL
        const offscreenCanvas = createOffscreenCanvas();
        const renderFn = (_req: unknown, bgImage?: HTMLImageElement) => {
          return renderDailyCardCanvas(offscreenCanvas, renderOptions, bgImage);
        };
        const result = await generateDailyCardImage(
          {
            prompt: `${template.name}风格日签，情绪：${emotion}`,
            emotion,
            template: template.id,
            size: { width: 750, height: 1000 },
          },
          renderFn,
        );
        if (controller.signal.aborted) return;
        setImageDataUrl(result.imageUrl);
        setImageSource(result.source);
      } finally {
        setGenerating(false);
        abortRef.current = null;
      }
    },
    [username, createOffscreenCanvas],
  );

  // 重新生成文案（换一换）
  const regenerateQuote = useCallback(
    async (emotion: EmotionKey, note?: string, nickname?: string) => {
      if (!username || !currentEmotion) return;
      await generateCard(emotion, note, nickname);
    },
    [username, currentEmotion, generateCard],
  );

  // 切换模板（纯 Canvas 快速渲染，不调用生图模型）
  const switchTemplate = useCallback(
    (templateId: DailyCardTemplateId) => {
      setCurrentTemplate(templateId);
      if (currentEmotion && currentQuote) {
        const renderOptions: CanvasRenderOptions = {
          date: getToday(),
          emotion: currentEmotion,
          quote: currentQuote,
          templateId,
          nickname: undefined,
        };
        const url = renderLocally(renderOptions);
        setImageDataUrl(url);
        setImageSource('canvas');
      }
    },
    [currentEmotion, currentQuote, renderLocally],
  );

  // 渲染已保存的日签（用于页面加载时显示）
  const renderSavedCard = useCallback(
    (card: DailyCardRecord) => {
      const renderOptions: CanvasRenderOptions = {
        date: card.date,
        emotion: card.emotion,
        quote: card.quote,
        templateId: card.template,
        nickname: undefined,
      };
      const url = renderLocally(renderOptions);
      setImageDataUrl(url);
      setImageSource('canvas');
    },
    [renderLocally],
  );

  // 保存日签到 IndexedDB
  const saveCard = useCallback(async (): Promise<boolean> => {
    if (!username || !currentEmotion || !currentQuote || !currentTemplate) return false;
    const record: Omit<DailyCardRecord, 'id' | 'createdAt'> = {
      username,
      date: getToday(),
      emotion: currentEmotion,
      quote: currentQuote,
      template: currentTemplate,
      emotionLabel: getEmotionLabel(currentEmotion),
      // 不存储图片 dataURL 以节省空间
      imageUrl: undefined,
    };
    await upsertDailyCard(record);
    await loadCards();
    return true;
  }, [username, currentEmotion, currentQuote, currentTemplate, loadCards]);

  // 下载图片
  const downloadImage = useCallback(() => {
    if (!imageDataUrl) return;
    const filename = `青心树洞-日签-${getToday()}`;
    downloadDailyCard(imageDataUrl, filename);
  }, [imageDataUrl]);

  // 分享图片
  const shareImage = useCallback(async (): Promise<boolean> => {
    if (!imageDataUrl) return false;
    return shareDailyCard(imageDataUrl);
  }, [imageDataUrl]);

  // 获取近 N 天日签
  const getRecent = useCallback(
    async (days: number): Promise<DailyCardRecord[]> => {
      if (!username) return [];
      return getRecentDailyCards(username, days);
    },
    [username],
  );

  // 停止生成
  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setGenerating(false);
  }, []);

  return {
    todayCard,
    history,
    loading,
    generating,
    currentQuote,
    currentTemplate,
    currentEmotion,
    imageDataUrl,
    imageSource,
    generateCard,
    regenerateQuote,
    switchTemplate,
    renderSavedCard,
    saveCard,
    downloadImage,
    shareImage,
    getRecent,
    stopGeneration,
    reload: loadCards,
  };
}
