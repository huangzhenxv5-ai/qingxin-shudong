import { useState, useMemo, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useContentAggregator } from '@/hooks/useContentAggregator';
import { ContentCard } from './ContentCard';
import { ContentDetail } from './ContentDetail';
import { CATEGORY_META, ALL_CATEGORIES } from '@/services/contentAggregator/categories';
import { type AIContentItem, type ContentCategory } from '@/services/contentAggregator/types';

type CategoryFilter = 'all' | ContentCategory;

/** 分类筛选 Tab 配置 */
const categoryTabs: { key: CategoryFilter; label: string; icon: string }[] = [
  { key: 'all', label: '全部', icon: '🌟' },
  ...ALL_CATEGORIES.map((cat) => ({
    key: cat as CategoryFilter,
    label: CATEGORY_META[cat].name,
    icon: CATEGORY_META[cat].icon,
  })),
];

/** 格式化日期为中文长格式 */
function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}月${d}日 ${weekdays[date.getDay()]}`;
}

export function ContentPage() {
  const {
    contents,
    allContents,
    activeCategory,
    progress,
    error,
    isRefreshing,
    isGenerating,
    imageProgressPercent,
    todayDate,
    refresh,
    retry,
    filterByCategory,
  } = useContentAggregator();

  const [selectedContent, setSelectedContent] = useState<AIContentItem | null>(null);

  /** 点击卡片：打开详情 */
  const handleClick = useCallback((content: AIContentItem) => {
    setSelectedContent(content);
  }, []);

  /** 关闭详情 */
  const handleClose = useCallback(() => {
    setSelectedContent(null);
  }, []);

  /** 切换分类筛选 */
  const handleCategoryChange = (category: CategoryFilter) => {
    filterByCategory(category);
  };

  /** 是否正在生成文本（首次加载） */
  const isGeneratingText = progress.phase === 'text' && !progress.textReady;

  /** 是否正在生成图片 */
  const isGeneratingImages = progress.phase === 'images';

  /** 是否有错误且无内容 */
  const showRetry = !!error && allContents.length === 0 && !isGenerating;

  /** 各分类内容数量统计 */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of allContents) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [allContents]);

  return (
    <MainLayout>
      {/* 页面标题 */}
      <div className="px-4 pt-6 pb-2 stagger-1">
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-xs font-medium uppercase tracking-wider mb-1"
              style={{ color: 'var(--color-accent)' }}
            >
              Positive Content
            </p>
            <h2 className="text-2xl font-bold font-heading" style={{ color: 'var(--color-text)' }}>
              正向内容
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              AI 每日生成温暖治愈的图文内容 · {formatDateLong(todayDate)}
            </p>
          </div>
          {/* 刷新按钮 */}
          <Button
            variant="primary"
            size="sm"
            fullWidth={false}
            onClick={refresh}
            aria-label="重新生成今日内容"
            disabled={isRefreshing || isGenerating}
          >
            <span aria-hidden="true">{isRefreshing ? '⏳' : '🔄'}</span>
            <span className="hidden sm:inline">{isRefreshing ? '生成中' : '重新生成'}</span>
          </Button>
        </div>
      </div>

      {/* 生成进度指示器 */}
      {isGenerating && (
        <div
          className="mx-4 mb-3 px-4 py-3 rounded-2xl stagger-2"
          style={{
            backgroundColor: 'var(--color-card)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          {isGeneratingText && (
            <div className="flex items-center gap-3">
              <span
                className="inline-block w-4 h-4 rounded-full border-2 border-t-transparent"
                style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}
                aria-hidden="true"
              />
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                AI 正在创作今日内容...
              </span>
            </div>
          )}
          {isGeneratingImages && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  正在生成配图... ({progress.imagesDone}/{progress.imagesTotal})
                </span>
                <span
                  className="text-xs font-medium font-heading"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {imageProgressPercent}%
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${imageProgressPercent}%`,
                    background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 分类筛选 Tab */}
      <div
        className="px-4 py-3 sticky top-0 z-10 stagger-3"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <div
          className="flex gap-1.5 overflow-x-auto scrollbar-hide"
          role="tablist"
          aria-label="分类筛选"
        >
          {categoryTabs.map((tab) => {
            const isActive = activeCategory === tab.key;
            const count = tab.key === 'all' ? allContents.length : (categoryCounts[tab.key] || 0);
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleCategoryChange(tab.key)}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] min-h-[44px] md:min-h-[36px]"
                style={{
                  backgroundColor: isActive
                    ? 'var(--color-primary)'
                    : 'var(--color-card)',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                  boxShadow: isActive ? 'var(--shadow-card)' : 'var(--shadow-soft)',
                }}
              >
                <span aria-hidden="true" className="mr-1">{tab.icon}</span>
                {tab.label}
                {count > 0 && (
                  <span
                    className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-heading"
                    style={{
                      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'var(--color-surface)',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 错误提示（无内容时展示重试） */}
      {showRetry && (
        <div className="px-4 py-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-4 animate-float" aria-hidden="true">😕</div>
            <p style={{ color: 'var(--color-text-secondary)' }} className="mb-4">
              内容生成失败：{error}
            </p>
            <button
              type="button"
              onClick={retry}
              className="px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-card-hover min-h-[44px] whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark, #3F6B58))',
                color: '#FFFFFF',
              }}
            >
              点击重试
            </button>
          </div>
        </div>
      )}

      {/* 内容卡片网格 */}
      {!showRetry && (
        <div className="px-4 py-3">
          {isGeneratingText && contents.length === 0 ? (
            <LoadingSkeleton />
          ) : contents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contents.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  onClick={handleClick}
                />
              ))}
            </div>
          ) : (
            !isGenerating && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-5xl mb-4 animate-float" aria-hidden="true">🌱</div>
                <p style={{ color: 'var(--color-text-secondary)' }}>暂无内容</p>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-text-hint)' }}>
                  点击右上角"重新生成"按钮创建今日内容
                </p>
              </div>
            )
          )}
        </div>
      )}

      {/* 底部说明 */}
      {contents.length > 0 && !isGeneratingText && (
        <div
          className="px-4 py-4 text-center text-xs stagger-5"
          style={{ color: 'var(--color-text-hint)' }}
        >
          <p>点击卡片查看完整内容</p>
          <p className="mt-1">
            每日 {allContents.length} 条 AI 生成内容 · 文本模型 agnes-2.0-flash · 图片模型 agnes-image-2.1-flash
          </p>
          <p className="mt-1">
            封面图采用 image-prompt-cover 技能 · 配图采用 ian-xiaohei-scenes 技能 · 文章采用 wechat-article-writer 技能
          </p>
        </div>
      )}

      {/* 详情模态框 */}
      <ContentDetail content={selectedContent} onClose={handleClose} />

      {/* 内联动画样式 */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </MainLayout>
  );
}

/** 加载骨架屏 */
function LoadingSkeleton() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      aria-live="polite"
      aria-busy="true"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden skeleton-shimmer"
          style={{
            backgroundColor: 'var(--color-card)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="h-40" style={{ backgroundColor: 'var(--color-surface)' }} />
          <div className="p-4 space-y-2">
            <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--color-surface)' }} />
            <div className="h-3 rounded w-full" style={{ backgroundColor: 'var(--color-surface)' }} />
            <div className="h-3 rounded w-1/2" style={{ backgroundColor: 'var(--color-surface)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
