import { BREATHING_MODE_LIST, ROUND_OPTIONS } from '@/constants/breathing';
import type { BreathingMode } from '@/types/breathing';
import type { BreathingStatus } from '@/hooks/useBreathing';

interface BreathingControlsProps {
  status: BreathingStatus;
  mode: BreathingMode;
  rounds: number;
  soundEnabled: boolean;
  onChangeMode: (mode: BreathingMode) => void;
  onChangeRounds: (rounds: number) => void;
  onToggleSound: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

// 呼吸练习控制面板
// - 模式选择区（仅 idle 状态可选）
// - 轮数选择（仅 idle 状态可选）
// - 音效开关
// - 主控制按钮：开始 / 暂停 / 恢复 / 重置
export function BreathingControls({
  status,
  mode,
  rounds,
  soundEnabled,
  onChangeMode,
  onChangeRounds,
  onToggleSound,
  onStart,
  onPause,
  onResume,
  onReset,
}: BreathingControlsProps) {
  const isIdle = status === 'idle';
  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isCompleted = status === 'completed';
  const isLocked = !isIdle; // 非空闲状态禁止切换模式/轮数

  return (
    <div className="space-y-4">
      {/* 模式选择区 */}
      <div>
        <p
          className="text-xs font-medium mb-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          选择呼吸模式
        </p>
        <div className="grid grid-cols-3 gap-2">
          {BREATHING_MODE_LIST.map((m) => {
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onChangeMode(m.id)}
                disabled={isLocked}
                aria-label={`选择${m.name}模式`}
                aria-pressed={isActive}
                className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isActive
                    ? 'var(--color-primary-light)'
                    : 'var(--color-surface)',
                  border: isActive
                    ? '2px solid var(--color-primary)'
                    : '2px solid transparent',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <span className="text-2xl" aria-hidden="true">{m.icon}</span>
                <span
                  className="text-xs font-bold"
                  style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text)' }}
                >
                  {m.name}
                </span>
              </button>
            );
          })}
        </div>
        {/* 当前模式说明 */}
        <p
          className="text-xs mt-2 leading-relaxed"
          style={{ color: 'var(--color-text-hint)' }}
        >
          {BREATHING_MODE_LIST.find((m) => m.id === mode)?.description}
          · 适用：{BREATHING_MODE_LIST.find((m) => m.id === mode)?.scene}
        </p>
      </div>

      {/* 轮数选择 + 音效开关 */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <p
            className="text-xs font-medium mb-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            练习轮数
          </p>
          <div className="flex gap-2">
            {ROUND_OPTIONS.map((r) => {
              const isActive = rounds === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => onChangeRounds(r)}
                  disabled={isLocked}
                  aria-label={`选择 ${r} 轮`}
                  aria-pressed={isActive}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] md:min-h-[36px] whitespace-nowrap"
                  style={{
                    backgroundColor: isActive
                      ? 'var(--color-primary)'
                      : 'var(--color-surface)',
                    color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                  }}
                >
                  {r} 轮
                </button>
              );
            })}
          </div>
        </div>

        {/* 音效开关 */}
        <div>
          <p
            className="text-xs font-medium mb-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            提示音
          </p>
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? '关闭提示音' : '开启提示音'}
            aria-pressed={soundEnabled}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] md:min-h-[36px] whitespace-nowrap"
            style={{
              backgroundColor: soundEnabled
                ? 'var(--color-primary-light)'
                : 'var(--color-surface)',
              color: soundEnabled
                ? 'var(--color-primary)'
                : 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            {soundEnabled ? '🔊 开' : '🔇 关'}
          </button>
        </div>
      </div>

      {/* 主控制按钮 */}
      <div className="flex gap-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
        {/* idle / completed：显示开始按钮 */}
        {(isIdle || isCompleted) && (
          <button
            type="button"
            onClick={onStart}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-primary)' }}
            aria-label={isCompleted ? '再来一次' : '开始呼吸练习'}
          >
            {isCompleted ? '🔄 再来一次' : '▶ 开始练习'}
          </button>
        )}

        {/* running：显示暂停 + 重置 */}
        {isRunning && (
          <>
            <button
              type="button"
              onClick={onPause}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
              style={{ backgroundColor: 'var(--color-warning)' }}
              aria-label="暂停呼吸练习"
            >
              ⏸ 暂停
            </button>
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-95"
              style={{
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-surface)',
              }}
              aria-label="重置呼吸练习"
            >
              ⏹ 重置
            </button>
          </>
        )}

        {/* paused：显示恢复 + 重置 */}
        {isPaused && (
          <>
            <button
              type="button"
              onClick={onResume}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
              style={{ backgroundColor: 'var(--color-primary)' }}
              aria-label="恢复呼吸练习"
            >
              ▶ 继续
            </button>
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-95"
              style={{
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-surface)',
              }}
              aria-label="重置呼吸练习"
            >
              ⏹ 重置
            </button>
          </>
        )}
      </div>
    </div>
  );
}
