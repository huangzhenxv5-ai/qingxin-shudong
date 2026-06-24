import { useState, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { type AIContentItem, type Illustration } from '@/services/contentAggregator/types';
import { CATEGORY_META } from '@/services/contentAggregator/categories';

interface ContentDetailProps {
  /** 选中的内容项，null 时不显示 */
  content: AIContentItem | null;
  /** 关闭回调 */
  onClose: () => void;
}

/**
 * 详情图片组件（带加载状态与兜底）
 */
function DetailImage({
  src,
  gradient,
  categoryIcon,
  alt,
  caption,
}: {
  src: string;
  gradient: string;
  categoryIcon: string;
  alt: string;
  caption?: string;
}) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  const handleLoad = useCallback(() => setStatus('loaded'), []);
  const handleError = useCallback(() => setStatus('error'), []);

  return (
    <figure className="mb-4">
      <div
        className="relative w-full rounded-xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)', aspectRatio: '16 / 9' }}
      >
        {/* 渐变兜底 */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ background: gradient, opacity: status === 'loaded' ? 0 : 1 }}
          aria-hidden="true"
        />

        {status === 'loading' && (
          <div className="absolute inset-0 animate-pulse flex items-center justify-center" style={{ background: gradient }} aria-hidden="true">
            <span className="text-4xl opacity-50">{categoryIcon}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: gradient }} aria-hidden="true">
            <span className="text-5xl opacity-70">{categoryIcon}</span>
          </div>
        )}

        {status !== 'error' && src && (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: status === 'loaded' ? 1 : 0 }}
          />
        )}
      </div>
      {caption && status === 'loaded' && (
        <figcaption
          className="mt-2 text-xs text-center"
          style={{ color: 'var(--color-text-hint)' }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * 内容详情模态框
 *
 * 展示完整内容：
 * - 短句形式：大字展示短句 + 封面图
 * - 文章形式：封面图 + 标题 + 正文段落 + 配图
 */
export function ContentDetail({ content, onClose }: ContentDetailProps) {
  if (!content) return null;

  const categoryMeta = CATEGORY_META[content.category];

  /** 渲染正文段落 */
  const renderContent = () => {
    if (content.form === 'quote') {
      return (
        <blockquote
          className="text-lg leading-relaxed font-medium text-center py-6 px-4 rounded-xl"
          style={{
            color: 'var(--color-text)',
            backgroundColor: 'var(--color-surface)',
            borderLeft: `4px solid ${categoryMeta.color}`,
          }}
        >
          {content.quote || content.summary}
        </blockquote>
      );
    }

    // 文章形式：按段落渲染
    const paragraphs = (content.content || content.summary).split('\n\n').filter((p) => p.trim());
    return (
      <div className="space-y-4">
        {paragraphs.map((para, index) => {
          const illustration: Illustration | undefined = content.illustrations[index];
          return (
            <div key={index}>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--color-text)' }}
              >
                {para}
              </p>
              {illustration && illustration.url && (
                <div className="mt-4">
                  <DetailImage
                    src={illustration.url}
                    gradient={categoryMeta.gradient}
                    categoryIcon={categoryMeta.icon}
                    alt={illustration.caption || content.title}
                    caption={illustration.caption}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Modal open={!!content} onClose={onClose} size="lg">
      {/* 分类 + 形式标签 */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${categoryMeta.color}1A`, color: categoryMeta.color }}
        >
          <span aria-hidden="true">{categoryMeta.icon}</span>
          {categoryMeta.name}
        </span>
        <span
          className="px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}
        >
          {content.form === 'article' ? '文章' : '短句'}
        </span>
      </div>

      {/* 标题 */}
      <h2
        className="text-xl font-bold mb-4 leading-snug"
        style={{ color: 'var(--color-text)' }}
      >
        {content.title}
      </h2>

      {/* 封面图（短句形式在正文之后展示，文章形式在正文之前） */}
      {content.form === 'article' && content.coverUrl && (
        <DetailImage
          src={content.coverUrl}
          gradient={categoryMeta.gradient}
          categoryIcon={categoryMeta.icon}
          alt={content.title}
        />
      )}

      {/* 正文内容 */}
      {renderContent()}

      {/* 短句形式的封面图放在正文之后 */}
      {content.form === 'quote' && content.coverUrl && (
        <div className="mt-4">
          <DetailImage
            src={content.coverUrl}
            gradient={categoryMeta.gradient}
            categoryIcon={categoryMeta.icon}
            alt={content.title}
          />
        </div>
      )}

      {/* 标签 */}
      {content.tags.length > 0 && (
        <div className="mt-6 flex items-center gap-2 flex-wrap">
          {content.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-md text-xs"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 底部来源说明 */}
      <div
        className="mt-6 pt-4 text-xs text-center"
        style={{
          color: 'var(--color-text-hint)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <p>内容由 AI 基于正向心理学与校园文化导向生成</p>
        <p className="mt-1">封面图采用 image-prompt-cover 技能 · 配图采用 ian-xiaohei-scenes 技能</p>
      </div>
    </Modal>
  );
}
