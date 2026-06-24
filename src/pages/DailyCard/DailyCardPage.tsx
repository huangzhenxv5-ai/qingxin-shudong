import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useDailyCard } from '@/hooks/useDailyCard';
import { useDiary } from '@/hooks/useDiary';
import { EMOTION_LIST, type EmotionKey } from '@/types';
import { DAILY_CARD_TEMPLATE_LIST } from '@/constants/dailyCardTemplates';
import { isImageGenConfigured } from '@/services/dailyCard';
import type { DailyCardTemplateId } from '@/types/dailyCard';
import { DailyCardHistory } from './DailyCardHistory';

export function DailyCardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { todayEntry } = useDiary();
  const {
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
    reload,
  } = useDailyCard();

  const [selectedEmotion, setSelectedEmotion] = useState<EmotionKey>(
    todayEntry?.emotion ?? 'calm',
  );
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);

  // 若今日已打卡，自动使用今日情绪
  useEffect(() => {
    if (todayEntry?.emotion && !currentEmotion) {
      setSelectedEmotion(todayEntry.emotion);
    }
  }, [todayEntry, currentEmotion]);

  // 页面加载时若有已保存的今日日签，渲染它
  useEffect(() => {
    if (todayCard && !imageDataUrl && !generating) {
      renderSavedCard(todayCard);
    }
  }, [todayCard, imageDataUrl, generating, renderSavedCard]);

  const handleGenerate = async (emotion: EmotionKey) => {
    setSelectedEmotion(emotion);
    setShowEmotionPicker(false);
    await generateCard(emotion, todayEntry?.note, undefined);
  };

  const handleSave = async () => {
    const ok = await saveCard();
    if (ok) {
      showToast('日签已保存', 'success');
      await reload();
    } else {
      showToast('保存失败，请先生成日签', 'warning');
    }
  };

  const handleDownload = () => {
    if (!imageDataUrl) {
      showToast('请先生成日签图片', 'warning');
      return;
    }
    downloadImage();
    showToast('图片已开始下载', 'success');
  };

  const handleShare = async () => {
    if (!imageDataUrl) {
      showToast('请先生成日签图片', 'warning');
      return;
    }
    const ok = await shareImage();
    if (ok) {
      showToast('图片已复制到剪贴板，可粘贴分享', 'success');
    } else {
      showToast('当前浏览器不支持复制图片，请使用下载功能', 'warning');
    }
  };

  const handleSwitchTemplate = (templateId: DailyCardTemplateId) => {
    switchTemplate(templateId);
  };

  const hasGenerated = !!currentQuote && !!currentEmotion;
  const imageGenAvailable = isImageGenConfigured();

  return (
    <MainLayout title="每日日签">
      <div className="space-y-4">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              每日情绪日签
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              把今天的心情，变成一张可以收藏的治愈图片
            </p>
          </div>
          <span className="text-3xl" aria-hidden="true">🎴</span>
        </div>

        {/* 今日打卡状态提示 */}
        {!todayEntry && (
          <Card variant="outlined">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">📔</span>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  今日还未记录心情
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  先去情绪日记打卡，日签会更懂你
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/diary')}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-white min-h-[44px] md:min-h-[32px] whitespace-nowrap"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                去打卡
              </button>
            </div>
          </Card>
        )}

        {/* 日签预览区 */}
        <Card variant="elevated">
          <div className="flex flex-col items-center">
            {generating ? (
              <div className="w-full aspect-[3/4] max-w-sm flex flex-col items-center justify-center gap-3">
                <div
                  className="w-12 h-12 border-3 border-current border-t-transparent rounded-full animate-spin"
                  style={{ color: 'var(--color-primary)' }}
                  aria-hidden="true"
                />
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {imageGenAvailable
                    ? 'AI 正在生成治愈文案与背景图...'
                    : 'AI 正在为你生成治愈文案...'}
                </p>
                {imageGenAvailable && (
                  <p className="text-xs" style={{ color: 'var(--color-text-hint)' }}>
                    生图模型渲染约需 5-10 秒，请稍候
                  </p>
                )}
              </div>
            ) : imageDataUrl ? (
              <>
                <div className="w-full max-w-sm">
                  <img
                    src={imageDataUrl}
                    alt="每日情绪日签"
                    className="w-full h-auto rounded-2xl"
                  />
                </div>
                <p
                  className="text-xs mt-3 text-center"
                  style={{ color: 'var(--color-text-hint)' }}
                >
                  {imageSource === 'model'
                    ? '🎨 由 AI 生图模型渲染背景'
                    : '🎨 本地 Canvas 渲染'}
                </p>
              </>
            ) : (
              <div className="w-full aspect-[3/4] max-w-sm flex flex-col items-center justify-center gap-3 rounded-2xl" style={{ backgroundColor: 'var(--color-surface)' }}>
                <span className="text-5xl" aria-hidden="true">🎴</span>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  点击下方按钮，生成今日日签
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* 操作区 */}
        <Card variant="default">
          <div className="space-y-3">
            {/* 主操作按钮 */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowEmotionPicker(true)}
                disabled={generating}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {hasGenerated ? '重新生成' : '生成日签'}
              </button>
              {hasGenerated && (
                <button
                  type="button"
                  onClick={() => regenerateQuote(selectedEmotion, todayEntry?.note, undefined)}
                  disabled={generating}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
                  style={{
                    color: 'var(--color-text-secondary)',
                    backgroundColor: 'var(--color-surface)',
                  }}
                  aria-label="换一换文案"
                >
                  🔄 换文案
                </button>
              )}
            </div>

            {/* 模板切换 */}
            {hasGenerated && (
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  切换模板
                </p>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {DAILY_CARD_TEMPLATE_LIST.map((tpl) => {
                    const isActive = currentTemplate === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleSwitchTemplate(tpl.id)}
                        aria-label={`切换到${tpl.name}模板`}
                        aria-pressed={isActive}
                        className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all min-h-[44px] md:min-h-[36px] whitespace-nowrap"
                        style={{
                          background: `linear-gradient(135deg, ${tpl.bgColorFrom} 0%, ${tpl.bgColorTo} 100%)`,
                          color: tpl.textColor,
                          border: isActive ? `2px solid var(--color-primary)` : '2px solid transparent',
                          transform: isActive ? 'scale(1.05)' : 'scale(1)',
                        }}
                      >
                        {tpl.name}
                      </button>
                    );
                  })}
                </div>
                {imageSource === 'model' && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-hint)' }}>
                    💡 切换模板将使用本地渲染（不调用生图模型）
                  </p>
                )}
              </div>
            )}

            {/* 保存/下载/分享 */}
            {hasGenerated && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all min-h-[44px]"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                  aria-label="保存日签"
                >
                  <span className="text-xl" aria-hidden="true">💾</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>保存</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all min-h-[44px]"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                  aria-label="下载图片"
                >
                  <span className="text-xl" aria-hidden="true">⬇️</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>下载</span>
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all min-h-[44px]"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                  aria-label="分享图片"
                >
                  <span className="text-xl" aria-hidden="true">📋</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>分享</span>
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* 历史日签 */}
        {!loading && <DailyCardHistory history={history} />}
      </div>

      {/* 情绪选择弹窗 */}
      <Modal
        open={showEmotionPicker}
        onClose={() => setShowEmotionPicker(false)}
        title="选择今日心情"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            选择一个最接近你今天心情的情绪，AI 会为你生成匹配的治愈日签
          </p>
          <div className="grid grid-cols-3 gap-3">
            {EMOTION_LIST.map((emotion) => {
              const isSelected = selectedEmotion === emotion.key;
              return (
                <button
                  key={emotion.key}
                  type="button"
                  onClick={() => handleGenerate(emotion.key)}
                  aria-label={`选择${emotion.label}生成日签`}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                  style={{
                    backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                    border: isSelected ? `2px solid ${emotion.color}` : '2px solid transparent',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <span className="text-3xl" aria-hidden="true">{emotion.emoji}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    {emotion.label}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setShowEmotionPicker(false)}
            className="w-full py-3 rounded-xl text-sm font-medium"
            style={{
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            取消
          </button>
        </div>
      </Modal>
    </MainLayout>
  );
}
