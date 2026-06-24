import { type AIContentItem, type ContentCategory, type ContentForm, type ProgressListener } from './types';
import { FULL_GENERATION_SYSTEM_PROMPT } from './skills';

/**
 * AI 内容生成服务（稳定版）
 *
 * 稳定性策略：
 * 1. 分批生成：短句与文章分开调用，避免单次输出 token 超限导致 JSON 截断
 * 2. JSON 修复：兼容截断、尾逗号、markdown 包裹等异常输出
 * 3. 重试机制：文本生成失败自动重试（指数退避），图片生成失败单张重试
 * 4. 请求超时：文本 90s、图片 60s，避免长时间挂起
 * 5. 内容校验：字段缺失自动补全，无效条目过滤
 * 6. 降级兜底：全部失败时返回预设内容，保证页面可用
 */

// ============ API 配置 ============

const API_BASE = import.meta.env.VITE_LLM_API_BASE || '/llm-api';
const API_KEY = import.meta.env.VITE_LLM_API_KEY || '';
const TEXT_MODEL = import.meta.env.VITE_LLM_MODEL || 'agnes-2.0-flash';
const IMAGE_MODEL = import.meta.env.VITE_IMAGE_GEN_MODEL || 'agnes-image-2.1-flash';

/** 图片生成并发数（降低以避免限流） */
const IMAGE_CONCURRENCY = 3;

/** 文本请求超时（ms）- 短句 */
const QUOTE_TIMEOUT = 90_000;
/** 文本请求超时（ms）- 文章（更长，因为 10 篇文章生成耗时较久） */
const ARTICLE_TIMEOUT = 180_000;
/** 图片请求超时（ms） */
const IMAGE_TIMEOUT = 60_000;

/** 文本生成最大重试次数 */
const TEXT_MAX_RETRY = 2;
/** 图片生成最大重试次数 */
const IMAGE_MAX_RETRY = 2;

/** Agnes AI 图片存储域名，通过 /agnes-img 代理避免跨域 */
const AGNES_IMG_HOST = 'https://platform-outputs.agnes-ai.space';

/** 短句目标数量 */
const QUOTE_COUNT = 10;
/** 文章目标数量 */
const ARTICLE_COUNT = 10;

// ============ 工具函数 ============

/** 获取今日日期 YYYY-MM-DD */
export function getTodayDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 将远程图片 URL 转为 Vite 代理 URL（开发环境） */
function toProxyUrl(remoteUrl: string): string {
  if (remoteUrl.startsWith(AGNES_IMG_HOST)) {
    return remoteUrl.replace(AGNES_IMG_HOST, '/agnes-img');
  }
  return remoteUrl;
}

/** 简单 ID 生成 */
function genId(date: string, index: number): string {
  return `ai_${date}_${String(index).padStart(3, '0')}`;
}

/** 指数退避延迟 */
function backoffDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 4000);
}

/** 睡眠 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fisher-Yates 洗牌算法（原地打乱）
 *
 * 用于将短句与文章随机交错排列，避免短句全在前、文章全在后
 */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 创建带超时的 AbortController
 *
 * 若外部已传入 signal，则同时监听外部取消
 */
function createTimeoutSignal(timeoutMs: number, externalSignal?: AbortSignal): AbortController {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  // 清理定时器避免内存泄漏
  controller.signal.addEventListener('abort', () => clearTimeout(timer), { once: true });
  return controller;
}

// ============ JSON 解析与修复 ============

/**
 * 从可能包含 markdown 代码块或额外文本的响应中提取 JSON 字符串
 */
function extractJson(text: string): string | null {
  const trimmed = text.trim();

  // 直接是 JSON
  if (trimmed.startsWith('{')) {
    return trimmed;
  }

  // markdown 代码块包裹
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // 尝试找到第一个 { 到最后一个 }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.substring(firstBrace, lastBrace + 1);
  }

  return null;
}

/**
 * 修复截断的 JSON 字符串
 *
 * 处理场景：
 * - 输出被 max_tokens 截断，JSON 不完整
 * - 尾随逗号
 * - 字符串未闭合
 */
function repairJson(jsonStr: string): string {
  let repaired = jsonStr.trim();

  // 移除尾随逗号（在 } 或 ] 之前）
  repaired = repaired.replace(/,\s*([}\]])/g, '$1');

  // 统计未闭合的括号
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < repaired.length; i++) {
    const ch = repaired[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === '{') openBraces++;
    else if (ch === '}') openBraces--;
    else if (ch === '[') openBrackets++;
    else if (ch === ']') openBrackets--;
  }

  // 若字符串未闭合，先闭合字符串
  if (inString) {
    repaired += '"';
  }

  // 重新统计（字符串闭合后）
  openBraces = 0;
  openBrackets = 0;
  inString = false;
  escape = false;
  for (let i = 0; i < repaired.length; i++) {
    const ch = repaired[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') openBraces++;
    else if (ch === '}') openBraces--;
    else if (ch === '[') openBrackets++;
    else if (ch === ']') openBrackets--;
  }

  // 移除可能残留的尾随逗号
  repaired = repaired.replace(/,\s*$/, '');

  // 闭合未配对的括号
  for (let i = 0; i < openBrackets; i++) repaired += ']';
  for (let i = 0; i < openBraces; i++) repaired += '}';

  return repaired;
}

/**
 * 安全解析 JSON：先直接解析，失败则尝试修复后解析
 */
function safeParseJson(text: string): unknown | null {
  const jsonStr = extractJson(text);
  if (!jsonStr) return null;

  // 第一次：直接解析
  try {
    return JSON.parse(jsonStr);
  } catch {
    // 继续尝试修复
  }

  // 第二次：修复后解析
  try {
    const repaired = repairJson(jsonStr);
    return JSON.parse(repaired);
  } catch {
    return null;
  }
}

// ============ 内容校验与补全 ============

/** 校验并转换分类 */
function normalizeCategory(cat: unknown): ContentCategory {
  const valid: ContentCategory[] = ['emotion', 'growth', 'relationship', 'study', 'life', 'inspiration'];
  return typeof cat === 'string' && (valid as string[]).includes(cat)
    ? (cat as ContentCategory)
    : 'inspiration';
}

/** 确保字符串非空 */
function ensureString(val: unknown, fallback = ''): string {
  return typeof val === 'string' && val.trim() ? val.trim() : fallback;
}

/** 确保字符串数组 */
function ensureStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((v): v is string => typeof v === 'string' && Boolean(v.trim()))
    .map((v) => v.trim())
    .slice(0, 5);
}

/** AI 返回的原始条目结构 */
interface RawItem {
  category?: string;
  form?: string;
  title?: string;
  summary?: string;
  quote?: string;
  content?: string;
  tags?: string[];
  coverPrompt?: string;
  illustrationPrompt?: string;
  illustrationCaption?: string;
}

/**
 * 将原始条目转换为校验后的 AIContentItem
 *
 * @returns 合法条目，若关键字段全缺则返回 null（被过滤）
 */
function sanitizeItem(raw: RawItem, date: string, index: number, expectedForm: ContentForm): AIContentItem | null {
  const title = ensureString(raw.title);
  const summary = ensureString(raw.summary);
  const coverPrompt = ensureString(raw.coverPrompt);

  // 关键字段全空：丢弃
  if (!title && !summary && !coverPrompt) {
    return null;
  }

  const now = new Date().toISOString();
  const item: AIContentItem = {
    id: genId(date, index),
    category: normalizeCategory(raw.category),
    form: expectedForm,
    title: title || (expectedForm === 'quote' ? '今日寄语' : '今日文章'),
    summary: summary || title || '',
    coverPrompt,
    coverUrl: '',
    illustrations: [],
    tags: ensureStringArray(raw.tags),
    publishedAt: now,
    date,
  };

  if (expectedForm === 'quote') {
    item.quote = ensureString(raw.quote, summary || title);
  } else {
    item.content = ensureString(raw.content, summary);
    const illusPrompt = ensureString(raw.illustrationPrompt);
    if (illusPrompt) {
      item.illustrations = [
        {
          caption: ensureString(raw.illustrationCaption, '配图'),
          prompt: illusPrompt,
          url: '',
        },
      ];
    }
  }

  return item;
}

/**
 * 从解析结果中提取并校验条目列表
 */
function extractItems(parsed: unknown, date: string, expectedForm: ContentForm): AIContentItem[] {
  if (!parsed || typeof parsed !== 'object') return [];
  const root = parsed as { items?: unknown };
  if (!Array.isArray(root.items)) return [];

  const items: AIContentItem[] = [];
  let globalIndex = 0;

  for (const raw of root.items) {
    if (!raw || typeof raw !== 'object') continue;
    const sanitized = sanitizeItem(raw as RawItem, date, globalIndex, expectedForm);
    if (sanitized) {
      items.push(sanitized);
      globalIndex++;
    }
  }

  return items;
}

// ============ 文本生成（分批 + 重试） ============

/**
 * 调用文本模型生成一批内容
 *
 * @param batchType 批次类型：quote 或 article
 * @param date 日期
 * @param signal 外部取消信号
 */
async function generateBatch(
  batchType: ContentForm,
  date: string,
  signal?: AbortSignal,
): Promise<AIContentItem[]> {
  if (!API_KEY) {
    throw new Error('未配置 LLM API Key');
  }

  const isQuote = batchType === 'quote';
  const count = isQuote ? QUOTE_COUNT : ARTICLE_COUNT;
  const formLabel = isQuote ? '短句' : '文章';

  const userPrompt = isQuote
    ? `今天是 ${date}。请严格生成 ${count} 条「短句形式」的正向内容。

要求：
1. 必须恰好生成 ${count} 条，不要多也不要少
2. 每条包含：category（分类）、form 固定为 "quote"、title（标题）、summary（摘要）、quote（1-2 句短句正文）、tags（2-3 个标签）、coverPrompt（英文封面图 prompt）
3. 覆盖全部 6 个分类（emotion/growth/relationship/study/life/inspiration）
4. 内容贴合 ${date} 的时间节点
5. 严格输出 JSON，不要输出任何其他内容`
    : `今天是 ${date}。请严格生成 ${count} 条「文章形式」的正向内容。

要求：
1. 必须恰好生成 ${count} 条，不要多也不要少
2. 每条包含：category（分类）、form 固定为 "article"、title（标题）、summary（摘要）、content（300-400 字正文，段落以 \\n\\n 分隔）、tags（2-3 个标签）、coverPrompt（英文封面图 prompt）、illustrationPrompt（英文配图 prompt）、illustrationCaption（配图中文说明）
3. 覆盖全部 6 个分类（emotion/growth/relationship/study/life/inspiration）
4. 内容贴合 ${date} 的时间节点
5. 正文控制在 300-400 字，不要过长
6. 严格输出 JSON，不要输出任何其他内容`;

  const maxTokens = isQuote ? 6144 : 16384;

  let lastError: Error | null = null;
  /** 保留最佳部分结果，最终重试仍不足时返回 */
  let bestItems: AIContentItem[] = [];

  for (let attempt = 0; attempt <= TEXT_MAX_RETRY; attempt++) {
    if (attempt > 0) {
      await sleep(backoffDelay(attempt - 1));
    }

    const timeoutSignal = createTimeoutSignal(isQuote ? QUOTE_TIMEOUT : ARTICLE_TIMEOUT, signal);

    try {
      const response = await fetch(`${API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: TEXT_MODEL,
          messages: [
            { role: 'system', content: FULL_GENERATION_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          stream: false,
          temperature: 0.85,
          max_tokens: maxTokens,
        }),
        signal: timeoutSignal.signal,
      });

      if (!response.ok) {
        throw new Error(`${formLabel}生成请求失败：HTTP ${response.status}`);
      }

      const data = await response.json();
      const rawText: string = data.choices?.[0]?.message?.content ?? '';

      if (!rawText.trim()) {
        throw new Error(`${formLabel}生成返回空内容`);
      }

      const parsed = safeParseJson(rawText);
      if (!parsed) {
        throw new Error(`${formLabel}生成返回内容无法解析为 JSON`);
      }

      const items = extractItems(parsed, date, batchType);
      if (items.length === 0) {
        throw new Error(`${formLabel}生成返回内容为空或全部无效`);
      }

      // 保留最佳部分结果
      if (items.length > bestItems.length) {
        bestItems = items;
      }

      // 数量达标（允许少 1 条容差）：直接返回
      if (items.length >= count - 1) {
        return items;
      }

      // 数量不足：记录错误，继续重试
      lastError = new Error(`${formLabel}数量不足：期望 ${count} 条，实际 ${items.length} 条`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // 外部取消：不重试，直接抛出
      if (signal?.aborted) {
        throw lastError;
      }
    }

    // 最后一次尝试：返回最佳部分结果（若有），否则抛出
    if (attempt === TEXT_MAX_RETRY) {
      if (bestItems.length > 0) {
        return bestItems;
      }
      throw lastError || new Error(`${formLabel}生成失败`);
    }
  }

  throw lastError || new Error(`${formLabel}生成失败`);
}

/**
 * 生成当日所有文本内容（分批：短句 + 文章）
 *
 * 分批策略：
 * - 批次 1：生成 20 条短句（输出短，token 压力小）
 * - 批次 2：生成 12 条文章（输出长，单独调用避免截断）
 * - 两批独立重试，互不影响
 * - 某批失败时用降级内容补齐，保证总数稳定
 */
async function generateDailyText(
  date: string,
  signal?: AbortSignal,
): Promise<AIContentItem[]> {
  // 并行生成两批（互不依赖）
  const [quoteResult, articleResult] = await Promise.allSettled([
    generateBatch('quote', date, signal),
    generateBatch('article', date, signal),
  ]);

  const quotes = quoteResult.status === 'fulfilled' ? quoteResult.value : [];
  const articles = articleResult.status === 'fulfilled' ? articleResult.value : [];

  // 记录失败批次的原因（便于排查）
  if (quoteResult.status === 'rejected') {
    const reason = quoteResult.reason instanceof Error ? quoteResult.reason.message : String(quoteResult.reason);
    console.warn('[内容生成] 短句批次失败：', reason);
  }
  if (articleResult.status === 'rejected') {
    const reason = articleResult.reason instanceof Error ? articleResult.reason.message : String(articleResult.reason);
    console.warn('[内容生成] 文章批次失败：', reason);
  }

  // 两批都失败：抛出错误触发降级
  if (quotes.length === 0 && articles.length === 0) {
    const errorMsg = [quoteResult, articleResult]
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map((r) => (r.reason instanceof Error ? r.reason.message : String(r.reason)))
      .join('; ');
    throw new Error(`文本生成全部失败：${errorMsg}`);
  }

  // 合并后随机打乱顺序，使短句与文章交错排列
  const merged = shuffle([...quotes, ...articles]);
  merged.forEach((item, index) => {
    item.id = genId(date, index);
  });

  return merged;
}

// ============ 图片生成（重试 + 并发池） ============

/**
 * 调用 agnes-image-2.1-flash 生成单张图片，返回代理后的 URL
 *
 * 失败自动重试（指数退避）
 */
async function generateImageWithRetry(prompt: string, signal?: AbortSignal): Promise<string> {
  if (!API_KEY || !prompt) {
    return '';
  }

  for (let attempt = 0; attempt <= IMAGE_MAX_RETRY; attempt++) {
    if (attempt > 0) {
      await sleep(backoffDelay(attempt - 1));
    }

    const timeoutSignal = createTimeoutSignal(IMAGE_TIMEOUT, signal);

    try {
      const response = await fetch(`${API_BASE}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: IMAGE_MODEL,
          prompt,
          n: 1,
          size: '1024x576',
        }),
        signal: timeoutSignal.signal,
      });

      if (!response.ok) {
        throw new Error(`图片生成请求失败：HTTP ${response.status}`);
      }

      const data = await response.json();
      const url: string | undefined = data.data?.[0]?.url;
      if (!url) {
        throw new Error('图片生成未返回 URL');
      }

      return toProxyUrl(url);
    } catch {
      if (signal?.aborted) {
        return '';
      }

      if (attempt === IMAGE_MAX_RETRY) {
        // 重试耗尽：返回空字符串，前端用渐变兜底
        return '';
      }
      // 否则继续重试
    }
  }

  return '';
}

/** 需要生成图片的任务 */
interface ImageTask {
  type: 'cover' | 'illustration';
  itemIndex: number;
  illustrationIndex?: number;
  prompt: string;
}

/**
 * 并发生成所有图片（封面 + 文章配图）
 *
 * - 并发池控制（IMAGE_CONCURRENCY）
 * - 每张图片独立重试
 * - 单张失败静默处理，保留空 URL
 */
async function generateAllImages(
  items: AIContentItem[],
  onProgress?: ProgressListener,
  signal?: AbortSignal,
): Promise<void> {
  const tasks: ImageTask[] = [];
  items.forEach((item, itemIndex) => {
    if (item.coverPrompt) {
      tasks.push({ type: 'cover', itemIndex, prompt: item.coverPrompt });
    }
    item.illustrations.forEach((_, illusIndex) => {
      const illus = item.illustrations[illusIndex];
      if (illus.prompt) {
        tasks.push({
          type: 'illustration',
          itemIndex,
          illustrationIndex: illusIndex,
          prompt: illus.prompt,
        });
      }
    });
  });

  const total = tasks.length;
  let done = 0;

  const emitProgress = () => {
    onProgress?.({
      phase: 'images',
      textReady: true,
      imagesDone: done,
      imagesTotal: total,
    });
  };

  emitProgress();

  // 并发池
  let cursor = 0;
  const workers: Promise<void>[] = [];

  const runWorker = async (): Promise<void> => {
    while (cursor < tasks.length) {
      if (signal?.aborted) return;
      const taskIndex = cursor++;
      const task = tasks[taskIndex];

      const url = await generateImageWithRetry(task.prompt, signal);

      if (url) {
        if (task.type === 'cover') {
          items[task.itemIndex].coverUrl = url;
        } else if (task.illustrationIndex !== undefined) {
          items[task.itemIndex].illustrations[task.illustrationIndex].url = url;
        }
      }

      done++;
      emitProgress();
    }
  };

  const workerCount = Math.min(IMAGE_CONCURRENCY, tasks.length);
  for (let i = 0; i < workerCount; i++) {
    workers.push(runWorker());
  }

  await Promise.all(workers);
}

// ============ 降级兜底内容 ============

/**
 * 生成降级内容（当 AI 生成完全失败时使用）
 *
 * 返回少量预设条目，保证页面可用，图片用渐变兜底
 */
function generateFallbackContent(date: string): AIContentItem[] {
  const now = new Date().toISOString();
  const presets: Array<{ category: ContentCategory; form: ContentForm; title: string; summary: string; quote?: string; content?: string }> = [
    {
      category: 'emotion',
      form: 'quote',
      title: '允许自己慢慢来',
      summary: '成长不是一场短跑，而是一场马拉松。',
      quote: '你不必时刻都全力以赴，允许自己有慢下来的时候，那也是前进的一部分。',
    },
    {
      category: 'growth',
      form: 'quote',
      title: '每一步都算数',
      summary: '微小的进步，日积月累就是蜕变。',
      quote: '今天比昨天多走一步，就是了不起的进步。别小看那些微小的努力。',
    },
    {
      category: 'relationship',
      form: 'quote',
      title: '真诚是最好的沟通',
      summary: '比起完美的话术，真诚更能打动人心。',
      quote: '与人相处，不必总是说对的话，真诚地说心里的话，就足够了。',
    },
    {
      category: 'study',
      form: 'quote',
      title: '专注当下',
      summary: '把注意力放在此刻能做的事上。',
      quote: '不必焦虑远方的山，先走好脚下的这一步。专注当下，效率自来。',
    },
    {
      category: 'life',
      form: 'quote',
      title: '发现小确幸',
      summary: '生活中的小美好，值得被看见。',
      quote: '阳光、微风、一杯热茶，生活里的小确幸，一直都在，等你发现。',
    },
    {
      category: 'inspiration',
      form: 'quote',
      title: '你本就闪闪发光',
      summary: '每个人都有属于自己的光芒。',
      quote: '你不需要成为别人，你本就闪闪发光。做自己，就是最好的答案。',
    },
  ];

  return presets.map((preset, index) => ({
    id: genId(date, index),
    category: preset.category,
    form: preset.form,
    title: preset.title,
    summary: preset.summary,
    quote: preset.quote,
    content: preset.content,
    coverPrompt: '',
    coverUrl: '',
    illustrations: [],
    tags: [],
    publishedAt: now,
    date,
  }));
}

// ============ 完整生成流程 ============

/**
 * 生成当日全部内容（文本 + 图片）
 *
 * 流程：
 * 1. 分批调用 agnes-2.0-flash 生成短句 + 文章（各自独立重试）
 * 2. 并行调用 agnes-image-2.1-flash 生成封面图与配图（单张重试）
 * 3. 全程通过 onProgress 上报进度
 * 4. 文本全部失败时使用降级内容
 */
export async function generateDailyContent(
  date: string = getTodayDate(),
  onProgress?: ProgressListener,
  signal?: AbortSignal,
): Promise<AIContentItem[]> {
  // Phase 1: 文本生成
  onProgress?.({
    phase: 'text',
    textReady: false,
    imagesDone: 0,
    imagesTotal: 0,
  });

  let items: AIContentItem[];
  try {
    items = await generateDailyText(date, signal);
  } catch {
    // 文本生成全部失败：使用降级内容
    items = generateFallbackContent(date);
  }

  onProgress?.({
    phase: 'text',
    textReady: true,
    imagesDone: 0,
    imagesTotal: 0,
  });

  // Phase 2: 图片生成（降级内容无 coverPrompt，会跳过）
  await generateAllImages(items, onProgress, signal);

  onProgress?.({
    phase: 'done',
    textReady: true,
    imagesDone: items.filter((i) => i.coverUrl).length,
    imagesTotal: items.filter((i) => i.coverPrompt).length,
  });

  return items;
}
