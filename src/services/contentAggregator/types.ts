// 正向内容板块 - AI 生成内容类型定义

/**
 * 内容分类（用于 AI 生成主题分布与前端筛选）
 */
export type ContentCategory =
  | 'emotion' // 情绪管理
  | 'growth' // 成长励志
  | 'relationship' // 人际关系
  | 'study' // 学习方法
  | 'life' // 生活感悟
  | 'inspiration'; // 灵感短句

/** 内容形式：短句 or 文章 */
export type ContentForm = 'quote' | 'article';

/** 分类元信息 */
export interface CategoryMeta {
  id: ContentCategory;
  name: string;
  icon: string;
  color: string;
  gradient: string;
}

/** 文章配图项 */
export interface Illustration {
  /** 配图说明（展示在图片下方） */
  caption: string;
  /** 生图 prompt（基于 ian-xiaohei-scenes 技能） */
  prompt: string;
  /** 生成的图片 URL（agnes-image-2.1-flash 返回） */
  url: string;
}

/**
 * AI 生成的单条内容项
 *
 * - quote 形式：title + quote（1-2 句短句）+ coverUrl
 * - article 形式：title + summary + content（完整正文）+ coverUrl + illustrations
 */
export interface AIContentItem {
  /** 唯一 ID */
  id: string;
  /** 分类 */
  category: ContentCategory;
  /** 内容形式 */
  form: ContentForm;
  /** 标题 */
  title: string;
  /** 摘要（卡片展示用，1-2 句） */
  summary: string;
  /** 短句形式的内容（form === 'quote' 时填充） */
  quote?: string;
  /** 完整正文（form === 'article' 时填充，段落以 \n\n 分隔） */
  content?: string;
  /** 封面图 prompt（基于 image-prompt-cover 技能） */
  coverPrompt: string;
  /** 封面图 URL（agnes-image-2.1-flash 生成） */
  coverUrl: string;
  /** 文章配图（form === 'article' 时填充） */
  illustrations: Illustration[];
  /** 标签 */
  tags: string[];
  /** 发布时间（ISO 字符串） */
  publishedAt: string;
  /** 所属日期（YYYY-MM-DD，用于每日缓存） */
  date: string;
}

/** 生成进度状态 */
export type GenerationPhase = 'idle' | 'text' | 'images' | 'done' | 'error';

/** 生成进度信息 */
export interface GenerationProgress {
  phase: GenerationPhase;
  /** 文本生成是否完成 */
  textReady: boolean;
  /** 已生成图片数 */
  imagesDone: number;
  /** 总图片数 */
  imagesTotal: number;
  /** 错误信息 */
  error?: string;
}

/** 生成状态监听器 */
export type ProgressListener = (progress: GenerationProgress) => void;
