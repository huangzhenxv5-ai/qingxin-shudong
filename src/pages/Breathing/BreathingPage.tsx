import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useBreathing } from '@/hooks/useBreathing';
import { BreathingCircle } from './BreathingCircle';
import { BreathingControls } from './BreathingControls';
import { BreathingComplete } from './BreathingComplete';
import { BREATHING_MODES } from '@/constants/breathing';

export function BreathingPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    state,
    modeConfig,
    result,
    stats,
    soundEnabled,
    start,
    pause,
    resume,
    reset,
    changeMode,
    changeRounds,
    toggleSound,
    reloadStats,
  } = useBreathing();

  const [completeOpen, setCompleteOpen] = useState(false);

  // 状态变化时弹出完成弹窗
  useEffect(() => {
    if (state.status === 'completed' && result) {
      setCompleteOpen(true);
      reloadStats();
      showToast('呼吸练习已完成', 'success');
    }
  }, [state.status, result, reloadStats, showToast]);

  const handleStart = () => {
    start();
    showToast('呼吸练习开始，跟随圆球节奏', 'info');
  };

  const handleRestart = () => {
    setCompleteOpen(false);
    start();
  };

  const handleViewGrowth = () => {
    setCompleteOpen(false);
    navigate('/growth');
  };

  const handleReset = () => {
    reset();
    showToast('已重置练习', 'info');
  };

  // 背景色随阶段渐变
  const bgGradient = `linear-gradient(135deg, ${state.bgColor}22 0%, ${state.accentColor}11 100%)`;

  return (
    <MainLayout title="呼吸放松">
      <div className="space-y-4">
        {/* 页面标题 */}
        <div className="flex items-center justify-between stagger-1">
          <div>
            <p
              className="text-xs font-medium uppercase tracking-wider mb-1"
              style={{ color: 'var(--color-accent)' }}
            >
              Breathing Exercise
            </p>
            <h2
              className="text-2xl font-bold font-heading"
              style={{ color: 'var(--color-text)' }}
            >
              呼吸放松练习
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              跟随圆球节奏，让心情慢慢平静下来
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
            🌬️
          </div>
        </div>

        {/* 练习区：圆球动画（背景色随阶段渐变） */}
        <Card variant="elevated" className="stagger-2">
          <div
            className="rounded-2xl p-6 transition-all duration-700"
            style={{ background: bgGradient }}
          >
            <div className="flex justify-center">
              <BreathingCircle state={state} size={280} />
            </div>

            {/* 进度指示点 */}
            <div
              className="flex items-center justify-center gap-2 mt-4"
              aria-label={`已完成 ${Math.min(state.currentRound - 1, state.rounds)} / ${state.rounds} 轮`}
            >
              {Array.from({ length: state.rounds }).map((_, idx) => {
                const completed = idx < state.currentRound - 1;
                const current = idx === state.currentRound - 1 && state.status !== 'idle' && state.status !== 'completed';
                return (
                  <span
                    key={idx}
                    className="block w-2.5 h-2.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: completed
                        ? 'var(--color-primary)'
                        : current
                          ? state.accentColor
                          : 'var(--color-border)',
                      transform: current ? 'scale(1.3)' : 'scale(1)',
                    }}
                    aria-hidden="true"
                  />
                );
              })}
            </div>

            {/* 总时长显示 */}
            {(state.status === 'running' || state.status === 'paused') && (
              <p
                className="text-xs text-center mt-3"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                已练习 {formatDuration(state.totalElapsed)} · 模式：{modeConfig.name}
              </p>
            )}
            {state.status === 'paused' && (
              <p
                className="text-xs text-center mt-1"
                style={{ color: 'var(--color-warning)' }}
              >
                ⏸ 已暂停，点击继续按钮恢复
              </p>
            )}
          </div>
        </Card>

        {/* 控制区 */}
        <Card variant="default" className="stagger-3">
          <BreathingControls
            status={state.status}
            mode={state.mode}
            rounds={state.rounds}
            soundEnabled={soundEnabled}
            onChangeMode={changeMode}
            onChangeRounds={changeRounds}
            onToggleSound={toggleSound}
            onStart={handleStart}
            onPause={pause}
            onResume={resume}
            onReset={handleReset}
          />
        </Card>

        {/* 历史统计 */}
        {stats && stats.totalCount > 0 && (
          <Card variant="outlined" className="stagger-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3
                  className="text-sm font-bold font-heading"
                  style={{ color: 'var(--color-text)' }}
                >
                  我的呼吸练习统计
                </h3>
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: 'var(--color-primary-soft)' }}
                  aria-hidden="true"
                >
                  📊
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div
                  className="text-center p-3 rounded-xl transition-all duration-200 hover:scale-[1.03]"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  <p
                    className="text-2xl font-bold font-heading"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {stats.totalCount}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--color-text-hint)' }}
                  >
                    累计次数
                  </p>
                </div>
                <div
                  className="text-center p-3 rounded-xl transition-all duration-200 hover:scale-[1.03]"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  <p
                    className="text-2xl font-bold font-heading"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {formatDuration(stats.totalDuration)}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--color-text-hint)' }}
                  >
                    累计时长
                  </p>
                </div>
                <div
                  className="text-center p-3 rounded-xl transition-all duration-200 hover:scale-[1.03]"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  <p
                    className="text-2xl font-bold font-heading"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {stats.totalRounds}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--color-text-hint)' }}
                  >
                    累计轮数
                  </p>
                </div>
              </div>

              {/* 模式偏好分布 */}
              <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <p
                  className="text-xs mb-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  模式偏好
                </p>
                <div className="flex gap-2">
                  {Object.entries(stats.modeDistribution).map(([m, count]) => {
                    const cfg = BREATHING_MODES[m as keyof typeof BREATHING_MODES];
                    const percent = stats.totalCount > 0
                      ? Math.round((count / stats.totalCount) * 100)
                      : 0;
                    return (
                      <div
                        key={m}
                        className="flex-1 p-2 rounded-lg text-center transition-all duration-200 hover:scale-[1.03]"
                        style={{ backgroundColor: 'var(--color-surface)' }}
                      >
                        <div className="text-lg" aria-hidden="true">{cfg.icon}</div>
                        <div
                          className="text-xs font-bold mt-0.5 font-heading"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {count} 次
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: 'var(--color-text-hint)' }}
                        >
                          {percent}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 适用场景提示 */}
        <Card variant="outlined" className="stagger-5">
          <div className="flex items-start gap-3">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent-soft, rgba(212,133,107,0.18)), var(--color-surface))',
              }}
              aria-hidden="true"
            >
              💡
            </div>
            <div>
              <h3
                className="text-sm font-bold font-heading mb-1"
                style={{ color: 'var(--color-text)' }}
              >
                何时使用呼吸练习？
              </h3>
              <ul
                className="text-xs space-y-1 leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <li>· 考前紧张焦虑，需要快速冷静</li>
                <li>· 与同学冲突后愤怒难平，需要平复</li>
                <li>· 晚上失眠焦虑，需要放松入睡</li>
                <li>· 日常情绪打卡后，系统推荐进行呼吸练习</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* 完成弹窗 */}
      <BreathingComplete
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        result={result}
        modeConfig={modeConfig}
        onViewGrowth={handleViewGrowth}
        onRestart={handleRestart}
      />
    </MainLayout>
  );
}

// 格式化时长（秒 → "X 分 Y 秒" 或 "Y 秒"）
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} 秒`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m} 分 ${s} 秒` : `${m} 分`;
}
