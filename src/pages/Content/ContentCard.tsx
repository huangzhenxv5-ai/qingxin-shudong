import { useState, useCallback } from 'react';
import { type AIContentItem } from '@/services/contentAggregator/types';
import { CATEGORY_META } from '@/services/contentAggregator/categories';

interface ContentCardProps {
  /** AI 生成的内容项 */
  content: AIContentItem;
  /** 点击回调：打开详情 */
  onClick: (content: AIContentItem) => void;
}

/**
 * 封面图组件
 *
 * 功能：
 * - 懒加载
 * - 加载中骨架屏（渐变色 + 脉冲动画）
 * - 加载失败回退（渐变色 + 分类图标）
 * - 悬停缩放效果
 */
function CoverImage({
  src,
  gradient,
  categoryIcon,
  alt,
}: {
  src: string;
  gradient: string;
  categoryIcon: string;
  alt: string;
}) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  const handleLoad = useCallback(() => setStatus('loaded'), []);
  const handleError = useCallback(() => setStatus('error'), []);

  return (
    <div className="relative w-full h-40 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
      {/* 底层渐变背景（始终存在，作为加载/失败的兜底） */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: gradient,
          opacity: status === 'loaded' ? 0 : 1,
        }}
        aria-hidden="true"
      />

      {/* 加载中脉冲动画 */}
      {status === 'loading' && (
        <div className="absolute inset-0 animate-pulse" style={{ background: gradient }} aria-hidden="true">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-30" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }} />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-20" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl opacity-60" aria-hidden="true">
            {categoryIcon}
          </span>
        </div>
      )}

      {/* 失败回退：渐变色 + 分类图标 */}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: gradient }} aria-hidden="true">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-30" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }} />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-20" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
          <span className="text-5xl opacity-80" aria-hidden="true">{categoryIcon}</span>
        </div>
      )}

      {/* 实际图片（加载成功后显示） */}
      {status !== 'error' && src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          style={{
            opacity: status === 'loaded' ? 1 : 0,
          }}
        />
      )}
    </div>
  );
}

/**
 * 正向内容卡片
 *
 * 展示：AI 生成封面图 + 分类标签 + 内容形式标签 + 标题 + 摘要 + 标签
 * 交互：点击整卡打开详情模态框查看完整内容
 */
export function ContentCard({ content, onClick }: ContentCardProps) {
  const categoryMeta = CATEGORY_META[content.category];
  const formLabel = content.form === 'article' ? '文章' : '短句';

  const handleClick = useCallback(() => {
    onClick(content);
  }, [content, onClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(content);
    }
  }, [content, onClick]);

  return (
    <article
      role="button"
      aria-label={`${categoryMeta.name}内容：${content.title}，点击查看完整内容`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 hover:-translate-y-1"
      style={{
        backgroundColor: 'var(--color-card)',
        boxShadow: 'var(--shadow-card)',
        // @ts-expect-error CSS custom property for focus ring color
        '--tw-ring-color': 'var(--color-primary)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
    >
      {/* 封面图区域 */}
      <div className="relative overflow-hidden">
        <CoverImage
          src={content.coverUrl}
          gradient={categoryMeta.gradient}
          categoryIcon={categoryMeta.icon}
          alt={content.title}
        />

        {/* 底部渐变遮罩（增强标签可读性） */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.35) 100%)',
          }}
          aria-hidden="true"
        />

        {/* 分类标签（左上） */}
        <span
          className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', color: '#FFFFFF' }}
        >
          <span aria-hidden="true">{categoryMeta.icon}</span>
          {categoryMeta.name}
        </span>

        {/* 内容形式标签（右上） */}
        <span
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
          style={{ backgroundColor: `${categoryMeta.color}CC`, color: '#FFFFFF' }}
        >
          {formLabel}
        </span>

        {/* 悬停时显示"点击查看"提示 */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          aria-hidden="true"
        >
          <span
            className="px-4 py-2 rounded-full text-sm font-medium text-white backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            阅读全文 →
          </span>
        </div>
      </div>

      {/* 内容区 */}
      <div className="p-4">
        <h3
          className="font-bold text-base mb-1.5 line-clamp-2"
          style={{ color: 'var(--color-text)' }}
        >
          {content.title}
        </h3>
        <p
          className="text-sm leading-relaxed line-clamp-2 mb-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {content.summary}
        </p>

        {/* 标签 */}
        {content.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap text-xs" style={{ color: 'var(--color-text-hint)' }}>
            {content.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
