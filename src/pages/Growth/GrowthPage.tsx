import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useGrowth } from '@/hooks/useGrowth';
import { useAuth } from '@/hooks/useAuth';
import { EMOTIONS } from '@/types';
import { exportUserData } from '@/utils/dataExport';
import { EmotionTrendChart } from './EmotionTrendChart';
import { EmotionRadarChart, EmotionDonutChart } from './EmotionRadarChart';
import { EmotionCalendar } from './EmotionCalendar';
import { UsageStats } from './UsageStats';
import { AchievementWall } from './AchievementWall';
import { AIMonthlySummary } from './AIMonthlySummary';

export function GrowthPage() {
  const { username } = useAuth();
  const { showToast } = useToast();
  const { profile, loading, trendRange, setTrendRange, reload } = useGrowth();
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const handleExport = async () => {
    if (!username) return;
    try {
      await exportUserData(username);
      showToast('数据已导出', 'success');
    } catch {
      showToast('导出失败，请稍后再试', 'error');
    }
    setShowExportConfirm(false);
  };

  if (loading || !profile) {
    return (
      <MainLayout title="成长档案">
        <div className="flex flex-col items-center justify-center py-20">
          <div
            className="w-10 h-10 border-3 border-current border-t-transparent rounded-full animate-spin mb-4"
            style={{ color: 'var(--color-primary)' }}
            aria-hidden="true"
          />
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            正在加载成长档案...
          </p>
        </div>
      </MainLayout>
    );
  }

  // 当前情绪状态标签
  const currentEmotion = profile.emotionDistribution[0];
  const currentEmotionLabel = currentEmotion
    ? `${EMOTIONS[currentEmotion.emotion].emoji} ${EMOTIONS[currentEmotion.emotion].label}`
    : '暂无记录';

  return (
    <MainLayout title="成长档案">
      <div className="space-y-4">
        {/* 页面标题 */}
        <div className="flex items-center justify-between stagger-1">
          <div>
            <p
              className="text-xs font-medium uppercase tracking-wider mb-1"
              style={{ color: 'var(--color-accent)' }}
            >
              Growth Archive
            </p>
            <h2
              className="text-2xl font-bold font-heading"
              style={{ color: 'var(--color-text)' }}
            >
              情绪成长档案
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              看见情绪的变化轨迹，记录每一步成长
            </p>
          </div>
          <div
            className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-soft), var(--color-accent-soft, rgba(212,133,107,0.18)))',
              boxShadow: 'var(--shadow-soft)',
            }}
            aria-hidden="true"
          >
            📈
          </div>
        </div>

        {/* 顶部概览卡片 */}
        <Card variant="elevated" className="stagger-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <OverviewItem
              icon="📅"
              value={profile.registerDays}
              unit="天"
              label="注册天数"
            />
            <OverviewItem
              icon="🎯"
              value={profile.totalInteractions}
              unit="次"
              label="累计互动"
            />
            <OverviewItem
              icon="⭐"
              value={profile.avgScore}
              unit="/5"
              label="平均情绪分"
            />
            <OverviewItem
              icon="🔥"
              value={profile.streakDays}
              unit="天"
              label="连续打卡"
            />
          </div>
          <div
            className="mt-3 pt-3 flex items-center justify-between border-t"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              当前主导情绪
            </span>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: currentEmotion
                  ? `${EMOTIONS[currentEmotion.emotion].color}22`
                  : 'var(--color-surface)',
                color: 'var(--color-text)',
              }}
            >
              {currentEmotionLabel}
            </span>
          </div>
        </Card>

        {/* 情绪趋势区 */}
        <Card variant="default" className="stagger-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-heading" style={{ color: 'var(--color-text)' }}>
                情绪趋势
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-hint)' }}>
                时间维度情绪变化分析
              </p>
            </div>
            <div
              role="group"
              aria-label="时间范围切换"
              className="flex p-0.5 rounded-xl"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              {([7, 30, 90] as const).map((r) => {
                const isActive = trendRange === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTrendRange(r)}
                    aria-pressed={isActive}
                    aria-label={`近${r}天`}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 min-h-[44px] md:min-h-[32px] whitespace-nowrap"
                    style={{
                      backgroundColor: isActive ? 'var(--color-card)' : 'transparent',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      boxShadow: isActive ? 'var(--shadow-card)' : 'none',
                    }}
                  >
                    {r}天
                  </button>
                );
              })}
            </div>
          </div>
          <EmotionTrendChart data={profile.emotionTrend} height={220} />
        </Card>

        {/* 情绪分布区 */}
        <Card variant="default" className="stagger-3">
          <h3 className="text-base font-bold font-heading mb-4" style={{ color: 'var(--color-text)' }}>
            情绪分布
          </h3>
          {profile.emotionDistribution.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <EmotionRadarChart data={profile.emotionDistribution} size={240} />
              <div className="flex flex-col items-center gap-3">
                <EmotionDonutChart data={profile.emotionDistribution} size={180} />
                <div className="w-full space-y-1">
                  {profile.emotionDistribution.slice(0, 5).map((d) => (
                    <div key={d.emotion} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="block w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: EMOTIONS[d.emotion].color }}
                          aria-hidden="true"
                        />
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          {EMOTIONS[d.emotion].emoji} {EMOTIONS[d.emotion].label}
                        </span>
                      </div>
                      <span style={{ color: 'var(--color-text)' }}>
                        {d.count} 次 · {d.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl block mb-2" aria-hidden="true">📊</span>
              <p className="text-sm" style={{ color: 'var(--color-text-hint)' }}>
                暂无情绪数据，去情绪日记打卡吧
              </p>
            </div>
          )}
        </Card>

        {/* 情绪日历区 */}
        <Card variant="default" className="stagger-4">
          <h3 className="text-base font-bold font-heading mb-4" style={{ color: 'var(--color-text)' }}>
            情绪日历
          </h3>
          <EmotionCalendar data={profile.emotionCalendar} />
        </Card>

        {/* 功能使用统计区 */}
        <Card variant="default" className="stagger-4">
          <h3 className="text-base font-bold font-heading mb-4" style={{ color: 'var(--color-text)' }}>
            功能使用统计
          </h3>
          <UsageStats data={profile.usageStats} />
        </Card>

        {/* 成长徽章区 */}
        <Card variant="default" className="stagger-5">
          <AchievementWall achievements={profile.achievements} />
        </Card>

        {/* AI 月度小结区 */}
        <Card variant="default" className="stagger-5">
          <AIMonthlySummary profile={profile} />
        </Card>

        {/* 数据管理区 */}
        <Card variant="outlined" className="stagger-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary-soft), var(--color-surface))',
                }}
                aria-hidden="true"
              >
                📦
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  数据导出与备份
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  导出全部数据为 JSON 文件，安全保存到本地
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowExportConfirm(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all active:scale-95 hover:shadow-card-hover min-h-[44px] md:min-h-[36px] whitespace-nowrap"
              style={{ backgroundColor: 'var(--color-primary)' }}
              aria-label="导出数据"
            >
              导出
            </button>
          </div>
        </Card>

        {/* 底部刷新按钮 */}
        <div className="pb-4 stagger-6">
          <button
            type="button"
            onClick={reload}
            className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:shadow-card"
            style={{
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-surface)',
            }}
            aria-label="刷新档案数据"
          >
            🔄 刷新数据
          </button>
        </div>
      </div>

      {/* 导出确认弹窗 */}
      <Modal
        open={showExportConfirm}
        onClose={() => setShowExportConfirm(false)}
        title="导出数据"
        size="sm"
      >
        <p className="mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          将你的所有数据（情绪日记、对话记录、卡牌游戏、情绪日签、呼吸练习）导出为 JSON 文件，保存到本地。密码等敏感信息已脱敏。
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowExportConfirm(false)}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-card-hover"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            确认导出
          </button>
        </div>
      </Modal>
    </MainLayout>
  );
}

interface OverviewItemProps {
  icon: string;
  value: number;
  unit: string;
  label: string;
}

function OverviewItem({ icon, value, unit, label }: OverviewItemProps) {
  return (
    <div
      className="flex flex-col items-center justify-center p-3 rounded-xl text-center transition-all duration-200 hover:scale-[1.03]"
      style={{ backgroundColor: 'var(--color-surface)' }}
      role="group"
      aria-label={`${label}：${value}${unit}`}
    >
      <span className="text-2xl mb-1" aria-hidden="true">{icon}</span>
      <div
        className="text-xl font-bold font-heading"
        style={{ color: 'var(--color-primary)' }}
      >
        {value}
        <span
          className="text-xs font-normal ml-0.5"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {unit}
        </span>
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </div>
    </div>
  );
}
