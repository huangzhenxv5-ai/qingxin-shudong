import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import {
  type AIContentItem,
  type ContentCategory,
  type GenerationProgress,
} from '@/services/contentAggregator/types';
import {
  fetchDailyContent,
  refreshDailyContent,
  getTodayDate,
} from '@/services/contentAggregator';
import { useToast } from '@/components/ui/Toast';

// ============================================================
// 模块级单例：内容生成管理器
//
// 设计目的：将生成生命周期与组件生命周期解耦
// - 组件卸载时生成继续在后台运行，不被打断
// - 组件重新挂载时订阅现有状态，不触发重复生成
// - 多次挂载/卸载共享同一个生成 Promise
// ============================================================

interface ManagerState {
  /** 当前日期 */
  date: string;
  /** 已生成的内容（含图片未就绪的中间态） */
  items: AIContentItem[];
  /** 生成进度 */
  progress: GenerationProgress;
  /** 错误信息 */
  error: string | null;
  /** 是否正在手动刷新 */
  isRefreshing: boolean;
  /** 最后更新时间戳 */
  lastUpdated: number | undefined;
  /** 当前进行中的生成 Promise（null 表示无任务） */
  currentPromise: Promise<void> | null;
  /** 生成代次 ID，用于作废旧任务结果 */
  generationId: number;
  /** 订阅者回调集合 */
  subscribers: Set<() => void>;
}

const initialState: ManagerState = {
  date: '',
  items: [],
  progress: { phase: 'idle', textReady: false, imagesDone: 0, imagesTotal: 0 },
  error: null,
  isRefreshing: false,
  lastUpdated: undefined,
  currentPromise: null,
  generationId: 0,
  subscribers: new Set(),
};

/** 模块级单例状态（组件卸载不销毁） */
let managerState: ManagerState = { ...initialState };

/** 状态版本号：每次 notifySubscribers 递增，用于快照稳定性判断 */
let stateVersion = 0;

/** 通知所有订阅者 */
function notifySubscribers(): void {
  stateVersion++;
  managerState.subscribers.forEach((cb) => cb());
}

/**
 * 执行一次生成任务
 *
 * @param date 日期
 * @param genId 代次 ID（用于判断是否已过期）
 * @param forceRefresh 是否强制刷新
 */
async function runGeneration(date: string, genId: number, forceRefresh: boolean): Promise<void> {
  const isStale = () => genId !== managerState.generationId;

  const onProgress = (p: GenerationProgress) => {
    if (isStale()) return;
    managerState.progress = p;
    notifySubscribers();
  };

  try {
    const result = forceRefresh
      ? await refreshDailyContent(date, onProgress)
      : await fetchDailyContent(date, onProgress);

    if (isStale()) return;

    managerState.items = result;
    managerState.progress = {
      phase: 'done',
      textReady: true,
      imagesDone: result.filter((i) => i.coverUrl).length,
      imagesTotal: result.filter((i) => i.coverPrompt).length,
    };
    managerState.lastUpdated = Date.now();
    managerState.error = null;
  } catch (err) {
    if (isStale()) return;
    const msg = err instanceof Error ? err.message : '内容生成失败';
    managerState.error = msg;
    managerState.progress = { ...managerState.progress, phase: 'error', error: msg };
  } finally {
    if (!isStale()) {
      managerState.isRefreshing = false;
      managerState.currentPromise = null;
    }
    notifySubscribers();
  }
}

/**
 * 启动生成（若已有同日期任务在跑则复用，不重复触发）
 *
 * @param date 日期
 * @param forceRefresh true 时强制重新生成（作废旧任务）
 */
function startGeneration(date: string, forceRefresh = false): void {
  // 已有同日期任务在跑且非强制刷新：复用，不重复触发
  if (managerState.currentPromise && managerState.date === date && !forceRefresh) {
    return;
  }

  // 强制刷新：作废当前任务
  managerState.date = date;
  managerState.generationId++;
  const genId = managerState.generationId;

  if (forceRefresh) {
    managerState.isRefreshing = true;
    managerState.progress = { phase: 'text', textReady: false, imagesDone: 0, imagesTotal: 0 };
    managerState.error = null;
  } else if (managerState.date !== date || managerState.items.length === 0) {
    managerState.progress = { phase: 'text', textReady: false, imagesDone: 0, imagesTotal: 0 };
    managerState.error = null;
  }

  managerState.currentPromise = runGeneration(date, genId, forceRefresh);
  notifySubscribers();
}

// ============ React 订阅适配 ============

/** useSyncExternalStore 的 subscribe 函数 */
function subscribe(callback: () => void): () => void {
  managerState.subscribers.add(callback);
  return () => {
    managerState.subscribers.delete(callback);
  };
}

/** useSyncExternalStore 的 getSnapshot 函数（返回稳定引用） */
let snapshotCache: Readonly<ManagerState> | null = null;
let snapshotVersion = -1;

function getSnapshot(): Readonly<ManagerState> {
  if (snapshotVersion !== stateVersion || snapshotCache === null) {
    snapshotCache = { ...managerState, subscribers: managerState.subscribers };
    snapshotVersion = stateVersion;
  }
  return snapshotCache;
}

// ============================================================
// React Hook
// ============================================================

/**
 * 正向内容板块 Hook（AI 生成版）
 *
 * 功能：
 * - 每日生成 20 条 AI 内容（10 短句 + 10 文章 + 封面图 + 配图）
 * - 生成生命周期与组件解耦：切换页面不打断生成
 * - 按日期缓存，每日自动更新
 * - 实时进度反馈（文本生成 → 图片生成）
 * - 分类筛选
 * - 失败降级 + 重试
 */
export function useContentAggregator() {
  const toast = useToast();

  // 订阅模块级单例状态（组件卸载只取消订阅，不中断生成）
  const state = useSyncExternalStore(subscribe, getSnapshot);

  const [activeCategory, setActiveCategory] = useState<ContentCategory | 'all'>('all');
  const todayDate = getTodayDate();

  // 初始加载：挂载时启动生成（若已在跑则复用）
  useEffect(() => {
    startGeneration(todayDate);
  }, [todayDate]);

  // 错误提示（仅在错误状态变化时触发）
  useEffect(() => {
    if (state.error) {
      toast.showToast(`内容生成失败：${state.error}`, 'error');
    }
  }, [state.error, toast]);

  // 跨日检测：若用户跨天使用，自动刷新
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && getTodayDate() !== todayDate) {
        window.location.reload();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [todayDate]);

  /** 手动刷新（强制重新生成） */
  const refresh = useCallback(async () => {
    if (state.isRefreshing || state.currentPromise) return;
    startGeneration(todayDate, true);
    toast.showToast('正在重新生成内容...', 'info');
  }, [todayDate, state.isRefreshing, state.currentPromise, toast]);

  /** 重试 */
  const retry = useCallback(() => {
    startGeneration(todayDate, true);
  }, [todayDate]);

  /** 分类筛选 */
  const filterByCategory = useCallback((category: ContentCategory | 'all') => {
    setActiveCategory(category);
  }, []);

  /** 筛选后的内容 */
  const filteredContents = activeCategory === 'all'
    ? state.items
    : state.items.filter((item) => item.category === activeCategory);

  /** 是否正在生成（文本或图片） */
  const isGenerating = state.progress.phase === 'text' || state.progress.phase === 'images';

  /** 图片生成进度百分比 */
  const imageProgressPercent = state.progress.imagesTotal > 0
    ? Math.round((state.progress.imagesDone / state.progress.imagesTotal) * 100)
    : 0;

  return {
    contents: filteredContents,
    allContents: state.items,
    activeCategory,
    progress: state.progress,
    error: state.error,
    isRefreshing: state.isRefreshing,
    isGenerating,
    imageProgressPercent,
    lastUpdated: state.lastUpdated,
    todayDate,
    refresh,
    retry,
    filterByCategory,
  };
}
