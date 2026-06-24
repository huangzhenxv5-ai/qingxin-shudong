import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { EmotionSelector } from '@/components/EmotionSelector';
import { type EmotionKey } from '@/types';
import { formatDateChinese, getToday, getWeekday } from '@/utils/date';

interface DiaryEditorProps {
  initialDate?: string;
  initialEmotion?: EmotionKey | null;
  initialIntensity?: number;
  initialContent?: string;
  onCancel?: () => void;
  onSave?: (data: {
    date: string;
    emotion: EmotionKey;
    intensity: number;
    content: string;
  }) => void;
}

const MAX_LENGTH = 500;

export function DiaryEditor({
  initialDate,
  initialEmotion = null,
  initialIntensity = 2,
  initialContent = '',
  onCancel,
  onSave,
}: DiaryEditorProps) {
  const [date] = useState(initialDate ?? getToday());
  const [emotion, setEmotion] = useState<EmotionKey | null>(initialEmotion);
  const [intensity, setIntensity] = useState(initialIntensity);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  const charCount = content.length;
  const canSave = emotion !== null && content.trim().length > 0;

  const handleSave = () => {
    if (!canSave || !emotion) return;
    setSaving(true);
    onSave?.({
      date,
      emotion,
      intensity,
      content: content.trim(),
    });
    setSaving(false);
  };

  return (
    <MainLayout showTabBar={false} title="写日记">
      <div className="space-y-4">
        {/* 顶部：返回 + 日期 + 保存 */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            aria-label="返回"
            className="btn-icon transition-colors focus-visible:outline-none"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="flex-1 text-center min-w-0">
            <h1
              className="text-lg font-bold truncate"
              style={{ color: 'var(--color-text)' }}
            >
              {formatDateChinese(date)}
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-text-hint)' }}>
              {getWeekday(date)}
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            fullWidth={false}
            loading={saving}
            disabled={!canSave}
            onClick={handleSave}
            aria-label="保存日记"
          >
            保存
          </Button>
        </div>

        {/* 情绪选择 */}
        <section
          className="card p-4"
          aria-labelledby="emotion-section-title"
        >
          <h2
            id="emotion-section-title"
            className="text-base font-bold mb-3"
            style={{ color: 'var(--color-text)' }}
          >
            今天的心情
          </h2>
          <EmotionSelector
            value={emotion}
            intensity={intensity}
            onChange={setEmotion}
            onIntensityChange={setIntensity}
          />
        </section>

        {/* 文本编辑区 */}
        <section
          className="card p-4"
          aria-labelledby="content-section-title"
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              id="content-section-title"
              className="text-base font-bold"
              style={{ color: 'var(--color-text)' }}
            >
              日记内容
            </h2>
            <span
              className="text-xs"
              style={{
                color:
                  charCount > MAX_LENGTH
                    ? 'var(--color-danger)'
                    : 'var(--color-text-hint)',
              }}
              aria-live="polite"
            >
              {charCount} / {MAX_LENGTH}
            </span>
          </div>

          <label htmlFor="diary-content" className="sr-only">
            日记内容
          </label>
          <textarea
            id="diary-content"
            value={content}
            onChange={(e) => {
              const val = e.target.value;
              if (val.length <= MAX_LENGTH) {
                setContent(val);
              }
            }}
            placeholder="写下今天发生的故事和你的感受..."
            rows={8}
            maxLength={MAX_LENGTH}
            className="input-field resize-none leading-relaxed"
            style={{
              minHeight: 160,
            }}
            aria-describedby="diary-content-hint"
          />
          <p
            id="diary-content-hint"
            className="mt-2 text-xs"
            style={{ color: 'var(--color-text-hint)' }}
          >
            可以写下任何你想记录的内容，这是属于你的私密空间 💚
          </p>
        </section>

        {/* 底部操作按钮 */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={onCancel}
            aria-label="取消编辑"
          >
            取消
          </Button>
          <Button
            variant="primary"
            fullWidth
            loading={saving}
            disabled={!canSave}
            onClick={handleSave}
            aria-label="保存日记"
          >
            保存日记
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
