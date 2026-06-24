import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { QuickCheckIn } from '@/components/dashboard/QuickCheckIn';
import { TrendCard } from '@/components/dashboard/TrendCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { HomeStatsCard } from '@/components/dashboard/HomeStatsCard';
import { CrisisOverlay } from '@/components/CrisisOverlay';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useDiary } from '@/hooks/useDiary';
import { useCardGame } from '@/hooks/useCardGame';
import { useCrisis } from '@/hooks/useCrisis';
import { useAuthStore } from '@/stores/authStore';
import { EMOTIONS, type EmotionKey } from '@/types';
import { getConversationsByUsername } from '@/db/conversationStore';

export function HomePage() {
  const navigate = useNavigate();
  const username = useAuthStore((s) => s.username);
  const { entries, todayEntry, checkIn } = useDiary();
  const { totalGames } = useCardGame();
  const { crisisTriggered, checkText, dismiss } = useCrisis();
  const { showToast } = useToast();
  const [chatCount, setChatCount] = useState(0);

  // 加载对话数
  useEffect(() => {
    if (!username) return;
    getConversationsByUsername(username).then((convs) => setChatCount(convs.length));
  }, [username]);

  // 打卡：弹出输入框记录文字
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [pendingEmotion, setPendingEmotion] = useState<EmotionKey | null>(null);
  const [note, setNote] = useState('');
  const [recommendCardOpen, setRecommendCardOpen] = useState(false);
  const [recommendBreathingOpen, setRecommendBreathingOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCheckIn = (emotion: EmotionKey) => {
    setPendingEmotion(emotion);
    setNote(todayEntry?.note ?? '');
    setCheckInModalOpen(true);
  };

  const handleSubmitCheckIn = async () => {
    if (!pendingEmotion || saving) return;
    const completedEmotion = pendingEmotion;
    setSaving(true);
    try {
      await checkIn(pendingEmotion, note);
      // 危机检测
      checkText(note, 'diary');
      setCheckInModalOpen(false);
      setNote('');
      setPendingEmotion(null);
      // 打卡完成后根据情绪智能推荐
      // 焦虑/低落/难过 → 推荐呼吸练习；其他 → 推荐生成日签
      if (completedEmotion === 'anxious' || completedEmotion === 'low' || completedEmotion === 'sad') {
        setRecommendBreathingOpen(true);
      } else {
        setRecommendCardOpen(true);
      }
    } catch (err) {
      console.error('[home] 打卡保存失败：', err);
      showToast(err instanceof Error ? err.message : '保存失败，请重试', 'error');
    } finally {
      setSaving(false);
    }
  };

  const pendingEmotionConfig = pendingEmotion ? EMOTIONS[pendingEmotion] : null;

  return (
    <MainLayout>
      <WelcomeCard />
      <QuickCheckIn
        todayEntry={todayEntry ? { emotion: todayEntry.emotion, note: todayEntry.note } : null}
        onCheckIn={handleCheckIn}
      />
      <HomeStatsCard
        diaryCount={entries.length}
        chatCount={chatCount}
        cardGameCount={totalGames}
      />
      {/* 成长档案入口 */}
      <section className="px-4 sm:px-6 mb-4 animate-fade-in-up stagger-3" aria-label="成长档案入口">
        <button
          type="button"
          onClick={() => navigate('/growth')}
          className="group w-full rounded-3xl p-5 flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[0.98] focus-visible:outline-none"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-card) 100%)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--color-border)',
          }}
          aria-label="查看我的成长档案"
        >
          <div className="flex items-center gap-4">
            <span
              className="text-3xl w-12 h-12 flex items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
              aria-hidden="true"
            >
              📈
            </span>
            <div className="text-left">
              <h3 className="font-heading font-bold text-base" style={{ color: 'var(--color-text)' }}>
                我的成长档案
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                查看情绪趋势、成就徽章和 AI 月度小结
              </p>
            </div>
          </div>
          <span
            className="text-2xl transition-transform duration-300 group-hover:translate-x-1"
            style={{ color: 'var(--color-primary)' }}
            aria-hidden="true"
          >
            ›
          </span>
        </button>
      </section>
      <TrendCard entries={entries} days={7} />
      <QuickActions />

      {/* 温暖寄语 */}
      <section className="px-4 sm:px-6 pb-4 animate-fade-in-up stagger-5" aria-label="每日小贴士">
        <div
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, var(--color-accent-light) 0%, var(--color-card) 100%)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            className="absolute -top-8 -right-8 w-28 h-28 opacity-15 blob-shape"
            style={{ backgroundColor: 'var(--color-accent)' }}
            aria-hidden="true"
          />
          <div className="relative flex items-start gap-4">
            <span
              className="text-2xl w-12 h-12 flex items-center justify-center rounded-2xl flex-shrink-0"
              style={{ backgroundColor: 'var(--color-accent-light)' }}
              aria-hidden="true"
            >
              💚
            </span>
            <div>
              <h3
                className="font-heading font-bold mb-1.5 text-base"
                style={{ color: 'var(--color-text)' }}
              >
                每日小贴士
              </h3>
              <p
                className="text-sm leading-relaxed text-pretty"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                情绪没有好坏之分，每一种感受都是真实的。允许自己感受，也允许自己慢慢来。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 打卡输入弹窗 */}
      <Modal
        open={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        title="记录今日心情"
        size="md"
      >
        {pendingEmotionConfig && (
          <div className="space-y-4">
            <div
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{
                backgroundColor: `${pendingEmotionConfig.color}15`,
                border: `1px solid ${pendingEmotionConfig.color}40`,
              }}
            >
              <span className="text-3xl" aria-hidden="true">{pendingEmotionConfig.emoji}</span>
              <div>
                <p className="font-heading font-bold" style={{ color: 'var(--color-text)' }}>
                  {pendingEmotionConfig.label}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  情绪分数 {pendingEmotionConfig.score} / 5
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="diary-note"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text)' }}
              >
                想说点什么吗？（可选，最多 200 字）
              </label>
              <textarea
                id="diary-note"
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 200))}
                placeholder="今天发生了什么？为什么是这个心情呢..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl resize-none outline-none transition-all duration-300"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1.5px solid var(--color-border)',
                }}
              />
              <p className="text-xs mt-1 text-right" style={{ color: 'var(--color-text-hint)' }}>
                {note.length} / 200
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCheckInModalOpen(false)}
                disabled={saving}
                className="flex-1 py-3 rounded-2xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSubmitCheckIn}
                disabled={saving}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  boxShadow: '0 2px 8px rgba(91, 138, 114, 0.25)',
                }}
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 危机干预弹窗 */}
      <CrisisOverlay open={crisisTriggered} onClose={dismiss} />

      {/* 打卡后推荐生成日签 */}
      <Modal
        open={recommendCardOpen}
        onClose={() => setRecommendCardOpen(false)}
        title="打卡成功"
        size="sm"
      >
        <div className="space-y-4 text-center">
          <div className="text-5xl animate-scale-in" aria-hidden="true">🎉</div>
          <p className="text-sm" style={{ color: 'var(--color-text)' }}>
            今日心情已记录！要不要把这份心情变成一张治愈日签？
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRecommendCardOpen(false)}
              className="flex-1 py-3 rounded-2xl text-sm font-medium transition-all duration-300"
              style={{
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              以后再说
            </button>
            <button
              type="button"
              onClick={() => {
                setRecommendCardOpen(false);
                navigate('/daily-card');
              }}
              className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--color-primary)',
                boxShadow: '0 2px 8px rgba(91, 138, 114, 0.25)',
              }}
            >
              生成日签
            </button>
          </div>
        </div>
      </Modal>

      {/* 打卡后推荐呼吸练习（焦虑/低落/难过情绪） */}
      <Modal
        open={recommendBreathingOpen}
        onClose={() => setRecommendBreathingOpen(false)}
        title="心情已记录"
        size="sm"
      >
        <div className="space-y-4 text-center">
          <div className="text-5xl animate-scale-in" aria-hidden="true">🌬️</div>
          <p className="text-sm" style={{ color: 'var(--color-text)' }}>
            感觉不太舒服的时候，试试 1 分钟呼吸练习，让心情慢慢平复下来吧。
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRecommendBreathingOpen(false)}
              className="flex-1 py-3 rounded-2xl text-sm font-medium transition-all duration-300"
              style={{
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              以后再说
            </button>
            <button
              type="button"
              onClick={() => {
                setRecommendBreathingOpen(false);
                navigate('/breathing');
              }}
              className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--color-primary)',
                boxShadow: '0 2px 8px rgba(91, 138, 114, 0.25)',
              }}
            >
              去呼吸练习
            </button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
