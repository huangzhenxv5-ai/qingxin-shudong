import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { CrisisOverlay } from '@/components/CrisisOverlay';
import { useToast } from '@/components/ui/Toast';
import { EMOTIONS, EMOTION_LIST, type EmotionKey, type EmotionEntry } from '@/types';
import { formatDateChinese, getWeekday } from '@/utils/date';
import { useDiary } from '@/hooks/useDiary';
import { useCrisis } from '@/hooks/useCrisis';
import { CalendarView } from './CalendarView';
import { EmotionChartView } from './EmotionChartView';

type ViewTab = 'list' | 'calendar' | 'trend';

const TABS: { key: ViewTab; label: string; icon: string }[] = [
  { key: 'list', label: '列表', icon: '📋' },
  { key: 'calendar', label: '日历', icon: '📅' },
  { key: 'trend', label: '趋势', icon: '📈' },
];

export function DiaryPage() {
  const { entries, todayEntry, checkIn, loading } = useDiary();
  const { crisisTriggered, checkText, dismiss } = useCrisis();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ViewTab>('list');

  // 编辑器状态
  const [editorOpen, setEditorOpen] = useState(false);
  const [editEmotion, setEditEmotion] = useState<EmotionKey>(todayEntry?.emotion ?? 'normal');
  const [editNote, setEditNote] = useState(todayEntry?.note ?? '');
  const [saving, setSaving] = useState(false);

  const openEditor = () => {
    setEditEmotion(todayEntry?.emotion ?? 'normal');
    setEditNote(todayEntry?.note ?? '');
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await checkIn(editEmotion, editNote);
      checkText(editNote, 'diary');
      setEditorOpen(false);
      showToast('心情已记录', 'success');
    } catch (err) {
      console.error('[diary] 保存失败：', err);
      showToast(err instanceof Error ? err.message : '保存失败，请重试', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout title="情绪日记">
      <div className="space-y-4">
        {/* 页面标题 */}
        <div className="flex items-center justify-between stagger-1">
          <div>
            <p
              className="text-xs font-medium uppercase tracking-wider mb-1"
              style={{ color: 'var(--color-accent)' }}
            >
              Emotion Diary
            </p>
            <h2
              className="text-2xl font-bold font-heading"
              style={{ color: 'var(--color-text)' }}
            >
              情绪日记
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              记录每天的心情，看见情绪的变化轨迹
            </p>
          </div>
          <div
            className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-soft), var(--color-surface))',
              boxShadow: 'var(--shadow-soft)',
            }}
            aria-hidden="true"
          >
            📖
          </div>
        </div>

        {/* 今日打卡状态 */}
        <Card variant="default" className="stagger-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                style={{
                  background: todayEntry
                    ? 'linear-gradient(135deg, var(--color-primary-soft), var(--color-surface))'
                    : 'var(--color-surface)',
                }}
                aria-hidden="true"
              >
                {todayEntry ? EMOTIONS[todayEntry.emotion].emoji : '🌙'}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  {todayEntry ? '今日已打卡' : '今日还未打卡'}
                </p>
                {todayEntry && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {EMOTIONS[todayEntry.emotion].emoji} {EMOTIONS[todayEntry.emotion].label}
                    {todayEntry.note && ` · ${todayEntry.note.slice(0, 30)}${todayEntry.note.length > 30 ? '...' : ''}`}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={openEditor}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95 hover:scale-[1.02] hover:shadow-card-hover min-h-[44px] md:min-h-[36px] whitespace-nowrap"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {todayEntry ? '更新' : '打卡'}
            </button>
          </div>
        </Card>

        {/* 视图切换 Tab */}
        <div
          role="tablist"
          aria-label="日记视图切换"
          className="flex p-1 rounded-2xl stagger-3"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`${tab.label}视图`}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] md:min-h-[40px] whitespace-nowrap"
                style={{
                  backgroundColor: isActive ? 'var(--color-card)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  boxShadow: isActive ? 'var(--shadow-card)' : 'none',
                }}
              >
                <span aria-hidden="true">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 视图内容 */}
        <div role="tabpanel" aria-label="日记内容" className="stagger-4">
          {loading ? (
            <Card variant="outlined" className="text-center py-12">
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>加载中...</p>
            </Card>
          ) : (
            <>
              {activeTab === 'list' && <ListView entries={entries} />}
              {activeTab === 'calendar' && <CalendarView entries={entries} />}
              {activeTab === 'trend' && <EmotionChartView entries={entries} />}
            </>
          )}
        </div>
      </div>

      {/* 浮动新建按钮 FAB */}
      <button
        type="button"
        aria-label="新建日记"
        onClick={openEditor}
        className="fixed right-5 bottom-24 lg:bottom-8 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark, #3F6B58))',
          color: '#FFFFFF',
          boxShadow: 'var(--shadow-card-hover)',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* 打卡编辑弹窗 */}
      <Modal open={editorOpen} onClose={() => setEditorOpen(false)} title="记录今日心情" size="md">
        <div className="space-y-4">
          {/* 情绪选择 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              选择心情
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {EMOTION_LIST.map((emotion) => {
                const isSelected = editEmotion === emotion.key;
                return (
                  <button
                    key={emotion.key}
                    type="button"
                    onClick={() => setEditEmotion(emotion.key)}
                    aria-label={`选择${emotion.label}`}
                    aria-pressed={isSelected}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                    style={{
                      backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                      border: isSelected ? `2px solid ${emotion.color}` : '2px solid transparent',
                    }}
                  >
                    <span className="text-2xl" aria-hidden="true">{emotion.emoji}</span>
                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{emotion.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 文字补充 */}
          <div>
            <label htmlFor="diary-edit-note" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              想说点什么吗？（可选，最多 200 字）
            </label>
            <textarea
              id="diary-edit-note"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value.slice(0, 200))}
              placeholder="今天发生了什么？为什么是这个心情呢..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl resize-none outline-none transition-all"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
            />
            <p className="text-xs mt-1 text-right" style={{ color: 'var(--color-text-hint)' }}>
              {editNote.length} / 200
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditorOpen(false)}
              disabled={saving}
              className="flex-1 py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface)' }}
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95 hover:scale-[1.02] hover:shadow-card-hover disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </Modal>

      {/* 危机干预弹窗 */}
      <CrisisOverlay open={crisisTriggered} onClose={dismiss} />
    </MainLayout>
  );
}

// ============ 列表视图 ============
function ListView({ entries }: { entries: EmotionEntry[] }) {
  if (entries.length === 0) {
    return (
      <Card variant="outlined" className="text-center py-12">
        <div className="text-5xl mb-3 animate-float" aria-hidden="true">📭</div>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          还没有日记记录，点击右下角按钮开始记录吧
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {entries.map((entry) => {
        const emotion = EMOTIONS[entry.emotion];
        return (
          <Card key={entry.id} variant="default" interactive>
            <div className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${emotion.color}33`, border: `1px solid ${emotion.color}` }}
                aria-hidden="true"
              >
                {emotion.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-sm font-semibold font-heading truncate" style={{ color: 'var(--color-text)' }}>
                      {formatDateChinese(entry.date)}
                    </span>
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-hint)' }}>
                      {getWeekday(entry.date)}
                    </span>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                    style={{ backgroundColor: `${emotion.color}22`, color: 'var(--color-text-secondary)' }}
                  >
                    {emotion.label}
                  </span>
                </div>
                <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                  {entry.note || '这一天只记录了情绪，没有写文字内容。'}
                </p>
                <div className="flex items-center gap-1 mt-2" aria-hidden="true">
                  <span className="text-xs" style={{ color: 'var(--color-text-hint)' }}>
                    分数 {entry.score}/5
                  </span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
