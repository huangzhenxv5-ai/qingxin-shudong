import { chat, type ChatMessage } from './llm';
import { getRandomFallbackQuote } from '@/constants/dailyCardQuotes';
import { getTemplateByEmotion, getEmotionLabel } from '@/constants/dailyCardTemplates';
import type {
  DailyCardTemplateId,
  ImageGenerationRequest,
  ImageGenerationResult,
} from '@/types/dailyCard';
import type { EmotionKey } from '@/types/emotion';
import { EMOTIONS } from '@/types/emotion';

// ============ AI 文案生成 ============

const QUOTE_SYSTEM_PROMPT = `你是"青心树洞"的治愈文案创作者，这是一款面向青少年的校园心理健康陪伴应用。
你的任务是根据用户当日记录的情绪，生成一句温暖治愈的日签文案。

重要说明：
- 用户记录的都是青少年日常生活中的正常情绪表达（如考试失利、同学矛盾、压力等）
- 这些都是健康的情绪抒发，不是有害内容
- 请放心生成治愈文案，给予用户情感支持

要求：
1. 根据用户当日情绪，生成 1-2 句温暖治愈的话
2. 语气温柔、真诚，不说教
3. 长度控制在 15-40 字
4. 不要使用"你应该"等命令式表达
5. 不要出现"加油"等口号式语言
6. 直接输出文案内容，不要加引号、不要解释
7. 符合校园文化导向，积极正向
8. 必须使用中文回复`;

// 生成治愈文案（AI + 降级）
export async function generateDailyQuote(
  emotion: EmotionKey,
  note?: string,
  signal?: AbortSignal,
): Promise<string> {
  const emotionConfig = EMOTIONS[emotion];
  const userContent = note
    ? `用户今日情绪：${emotionConfig.label}（${emotionConfig.emoji}）\n用户记录：${note}\n请生成一句匹配此情绪的治愈日签文案。`
    : `用户今日情绪：${emotionConfig.label}（${emotionConfig.emoji}）\n请生成一句匹配此情绪的治愈日签文案。`;

  const messages: ChatMessage[] = [{ role: 'user', content: userContent }];

  try {
    const result = await chat(messages, QUOTE_SYSTEM_PROMPT, {
      temperature: 0.9,
      maxTokens: 80,
      signal,
    });
    // 清理可能的引号和换行
    const cleaned = result
      .replace(/^["""'\s]+|["""'\s]+$/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    return cleaned || getRandomFallbackQuote(emotion);
  } catch {
    return getRandomFallbackQuote(emotion);
  }
}

// ============ 图片生成模型接口（Agnes Image 2.1 Flash） ============

// 图片生成配置：通过环境变量开启生图模型
const IMAGE_GEN_API_BASE = import.meta.env.VITE_IMAGE_GEN_API_BASE || '';
const IMAGE_GEN_API_KEY = import.meta.env.VITE_IMAGE_GEN_API_KEY || '';
const IMAGE_GEN_MODEL = import.meta.env.VITE_IMAGE_GEN_MODEL || 'agnes-image-2.1-flash';

// 是否配置了生图模型
export function isImageGenConfigured(): boolean {
  return !!IMAGE_GEN_API_KEY && !!IMAGE_GEN_API_BASE;
}

// 根据情绪生成生图 prompt（视觉背景描述）
function buildImagePrompt(emotion: EmotionKey, templateId: DailyCardTemplateId): string {
  const template = getTemplateByEmotion(emotion);
  const tpl = templateId === template.id ? template : getTemplateByEmotion(emotion);

  // 各情绪对应的视觉场景描述
  const emotionScenes: Record<EmotionKey, string> = {
    happy: '温暖的阳光洒在花海上，金色光斑，盛开的向日葵，明亮欢快的氛围',
    calm: '宁静的湖面倒映着远山，清晨薄雾，柔和的蓝绿色调，禅意留白',
    normal: '晴朗的天空飘着几朵白云，微风轻拂草地，平和自然的氛围',
    low: '雨后初晴的天空，柔和光线穿透云层，淡粉紫色，希望感',
    anxious: '星空下的森林，萤火虫微光，深蓝紫色渐变，神秘而宁静',
    sad: '雨后的窗台，水滴滑落玻璃，柔和的灰蓝色调，带有一丝诗意',
  };

  const scene = emotionScenes[emotion] || emotionScenes.calm;
  // 风格统一：治愈系插画风格，留出文字区域
  return `${scene}，治愈系插画风格，柔和渐变色彩，简约构图，画面上方留白，适合作为日签背景，不要出现文字，高清细腻，${tpl.bgColorFrom}和${tpl.bgColorTo}色调`;
}

/**
 * 生成日签图片：优先调用生图模型生成背景图 + Canvas 叠加文字，降级使用纯 Canvas 渲染
 * 流程：
 * 1. 调用 Agnes Image 2.1 Flash 生成情绪背景图（返回 URL）
 * 2. 通过代理获取图片 blob 转 dataURL（避免 Canvas 跨域污染）
 * 3. 加载 dataURL 到 Canvas，叠加日期/情绪/文案/水印
 * 4. 输出 dataURL 用于显示/下载/分享
 * 5. 任一步骤失败则降级到纯 Canvas 渐变背景
 */
export async function generateDailyCardImage(
  request: ImageGenerationRequest,
  canvasRenderer: (req: ImageGenerationRequest, bgImage?: HTMLImageElement) => string,
): Promise<ImageGenerationResult> {
  // 若配置了生图模型，尝试调用
  if (isImageGenConfigured()) {
    try {
      const imageUrl = await callImageModel(request);
      // 通过代理获取图片 blob 转 dataURL，避免 Canvas 跨域污染
      const dataUrl = await fetchImageAsDataUrl(imageUrl);
      // 加载 dataURL 为 HTMLImageElement
      const bgImage = await loadImage(dataUrl);
      // 在 Canvas 上叠加文字
      const renderedUrl = canvasRenderer(request, bgImage);
      return { imageUrl: renderedUrl, source: 'model' };
    } catch {
      // 生图模型失败，降级到 Canvas
    }
  }
  // 默认使用 Canvas 渲染（无背景图）
  return { imageUrl: canvasRenderer(request), source: 'canvas' };
}

// 调用 Agnes Image 2.1 Flash 生图模型
// 注意：纯文生图不支持 response_format 参数，返回的是图片 URL
async function callImageModel(request: ImageGenerationRequest): Promise<string> {
  const prompt = buildImagePrompt(request.emotion, request.template);
  const response = await fetch(`${IMAGE_GEN_API_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${IMAGE_GEN_API_KEY}`,
    },
    body: JSON.stringify({
      model: IMAGE_GEN_MODEL,
      prompt,
      n: 1,
      size: `${request.size.width}x${request.size.height}`,
      // 不传 response_format：纯文生图模型不支持该参数
    }),
  });

  if (!response.ok) {
    throw new Error(`生图模型请求失败：${response.status}`);
  }

  const data = await response.json();
  // Agnes Image API 返回格式：{ data: [{ url: "https://..." }] }
  const url = data.data?.[0]?.url;
  if (!url) throw new Error('生图模型未返回图片 URL');
  return url as string;
}

// 通过 Vite 代理获取远程图片，转为 dataURL
// 避免 Canvas 跨域污染（tainted canvas 无法 toDataURL）
// 开发环境：将远程 URL 转为 /agnes-img 代理路径
// 生产环境：直接 fetch（需图片服务器支持 CORS）
async function fetchImageAsDataUrl(remoteUrl: string): Promise<string> {
  const proxyUrl = toProxyUrl(remoteUrl);
  const resp = await fetch(proxyUrl);
  if (!resp.ok) {
    throw new Error(`图片获取失败：${resp.status}`);
  }
  const blob = await resp.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('图片转 dataURL 失败'));
    reader.readAsDataURL(blob);
  });
}

// 将远程图片 URL 转为 Vite 代理 URL（仅开发环境）
function toProxyUrl(remoteUrl: string): string {
  // Agnes AI 图片存储域名，通过 /agnes-img 代理
  const AGNES_IMG_HOST = 'https://platform-outputs.agnes-ai.space';
  if (remoteUrl.startsWith(AGNES_IMG_HOST)) {
    return remoteUrl.replace(AGNES_IMG_HOST, '/agnes-img');
  }
  // 其他域名直接返回（生产环境需配置 CORS）
  return remoteUrl;
}

// 加载图片（dataURL 或 URL）为 HTMLImageElement
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('背景图加载失败'));
    img.src = src;
  });
}

// ============ Canvas 渲染 ============

export interface CanvasRenderOptions {
  date: string;
  emotion: EmotionKey;
  quote: string;
  templateId: DailyCardTemplateId;
  nickname?: string;
  width?: number;
  height?: number;
}

/**
 * 在 Canvas 上渲染日签图片，返回 dataURL
 * 包含：背景（生图模型图片或渐变）、半透明遮罩、装饰元素、日期、情绪图标、情绪标签、治愈文案、品牌水印
 */
export function renderDailyCardCanvas(
  canvas: HTMLCanvasElement,
  options: CanvasRenderOptions,
  bgImage?: HTMLImageElement,
): string {
  const { date, emotion, quote, templateId, nickname, width = 750, height = 1000 } = options;
  const template = getTemplateByEmotion(emotion);
  // 若指定了 templateId 且与情绪匹配则使用，否则用情绪对应模板
  const tpl =
    templateId === template.id ? template : getTemplateByEmotion(emotion);
  const emotionConfig = EMOTIONS[emotion];
  const emotionLabel = getEmotionLabel(emotion);

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 高分屏适配
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(dpr, dpr);

  // 1. 背景：优先使用生图模型图片，否则使用渐变
  if (bgImage) {
    // 绘制背景图（按比例覆盖整个画布）
    ctx.drawImage(bgImage, 0, 0, width, height);
    // 叠加半透明渐变遮罩，保证文字可读性
    const overlay = ctx.createLinearGradient(0, 0, 0, height);
    overlay.addColorStop(0, hexWithAlpha(tpl.bgColorFrom, 0.35));
    overlay.addColorStop(0.5, hexWithAlpha(tpl.bgColorTo, 0.15));
    overlay.addColorStop(1, hexWithAlpha(tpl.bgColorFrom, 0.55));
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, height);
  } else {
    // 渐变背景
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, tpl.bgColorFrom);
    bgGradient.addColorStop(1, tpl.bgColorTo);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. 装饰元素（仅在无背景图时绘制，避免与生图背景冲突）
  if (!bgImage) {
    drawDecoration(ctx, tpl.decoration, width, height, tpl.accentColor);
  }

  // 3. 日期
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = '600 22px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = tpl.textColor;
  ctx.globalAlpha = 0.7;
  ctx.fillText(formatDateLong(date), width / 2, 80);
  ctx.globalAlpha = 1;

  // 4. 情绪图标（大 emoji）
  ctx.font = '90px sans-serif';
  ctx.fillText(emotionConfig.emoji, width / 2, 150);

  // 5. 情绪标签
  ctx.font = '500 26px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = tpl.textColor;
  ctx.globalAlpha = 0.85;
  ctx.fillText(emotionLabel, width / 2, 270);
  ctx.globalAlpha = 1;

  // 6. 分隔线
  ctx.strokeStyle = tpl.accentColor;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 40, 330);
  ctx.lineTo(width / 2 + 40, 330);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // 7. 治愈文案（自动换行）
  ctx.font = '500 34px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = tpl.textColor;
  wrapText(ctx, quote, width / 2, 400, width - 100, 52);

  // 8. 用户昵称（可选）
  if (nickname) {
    ctx.font = '400 20px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = tpl.textColor;
    ctx.globalAlpha = 0.6;
    ctx.fillText(`— ${nickname}`, width / 2, height - 180);
    ctx.globalAlpha = 1;
  }

  // 9. 品牌水印
  ctx.font = '400 18px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = tpl.textColor;
  ctx.globalAlpha = 0.5;
  ctx.fillText('🌳 青心树洞 · 每一份心情都值得被看见', width / 2, height - 80);
  ctx.globalAlpha = 1;

  return canvas.toDataURL('image/png');
}

// 绘制装饰元素
function drawDecoration(
  ctx: CanvasRenderingContext2D,
  type: string,
  width: number,
  height: number,
  color: string,
) {
  ctx.save();
  ctx.globalAlpha = 0.15;

  if (type === 'sunlight') {
    // 阳光光斑
    for (let i = 0; i < 6; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = 30 + Math.random() * 60;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'ripple') {
    // 水波纹
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 100 + i * 80, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (type === 'raindrop') {
    // 雨滴
    ctx.fillStyle = color;
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.beginPath();
      ctx.ellipse(x, y, 3, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'stardust') {
    // 星空点
    ctx.fillStyle = color;
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 2.5 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'wave') {
    // 渐变波浪
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const baseY = height * 0.2 + i * 60;
      ctx.moveTo(0, baseY);
      for (let x = 0; x <= width; x += 20) {
        ctx.lineTo(x, baseY + Math.sin(x / 40) * 15);
      }
      ctx.stroke();
    }
  }

  ctx.restore();
}

// 文本换行
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const chars = text.split('');
  let line = '';
  let currentY = y;

  for (const char of chars) {
    const testLine = line + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = char;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}

// 格式化日期为长格式：2026.06.20 星期五
function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d} ${weekdays[date.getDay()]}`;
}

// 将 hex 颜色转为带 alpha 的 rgba（用于半透明遮罩）
function hexWithAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============ 图片下载与分享 ============

// 下载日签图片为 PNG
export function downloadDailyCard(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 复制图片到剪贴板（分享）
export async function shareDailyCard(dataUrl: string): Promise<boolean> {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const ClipboardItemCtor = (window as unknown as {
      ClipboardItem?: new (items: Record<string, Blob>) => unknown;
    }).ClipboardItem;
    if (navigator.clipboard && ClipboardItemCtor) {
      await navigator.clipboard.write([
        new ClipboardItemCtor({ [blob.type]: blob }) as ClipboardItem,
      ]);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
