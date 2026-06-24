import { useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { BreathingResult } from '@/hooks/useBreathing';
import type { BreathingModeConfig } from '@/types/breathing';

interface BreathingCompleteProps {
  open: boolean;
  onClose: () => void;
  result: BreathingResult | null;
  modeConfig: BreathingModeConfig;
  onViewGrowth: () => void;
  onRestart: () => void;
}

// 完成练习弹窗
// 展示练习统计（总时长、轮数）+ 鼓励语 + 记录到成长档案 / 再来一次
export function BreathingComplete({
  open,
  onClose,
  result,
  modeConfig,
  onViewGrowth,
  onRestart,
}: BreathingCompleteProps) {
  // ESC 关闭由 Modal 内部处理
  useEffect(() => {
    // 占位，保留扩展空间
  }, [open]);

  if (!result) return null;

  const minutes = Math.floor(result.duration / 60);
  const seconds = result.duration % 60;
  const durationText = minutes > 0 ? `${minutes} 分 ${seconds} 秒` : `${seconds} 秒`;

  return (
    <Modal open={open} onClose={onClose} title="练习完成" size="md">
      <div className="space-y-5">
        {/* 顶部庆祝图标 */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <div className="text-6xl" aria-hidden="true">🌿</div>
          <p
            className="text-sm text-center leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {result.encouragement}
          </p>
        </div>

        {/* 练习统计 */}
        <div
          className="grid grid-cols-3 gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <div className="text-center">
            <div className="text-2xl mb-1" aria-hidden="true">{modeConfig.icon}</div>
            <p
              className="text-xs"
              style={{ color: 'var(--color-text-hint)' }}
            >
              模式
            </p>
            <p
              className="text-sm font-bold mt-0.5"
              style={{ color: 'var(--color-text)' }}
            >
              {modeConfig.name}
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1" aria-hidden="true">🔁</div>
            <p
              className="text-xs"
              style={{ color: 'var(--color-text-hint)' }}
            >
              完成轮数
            </p>
            <p
              className="text-sm font-bold mt-0.5"
              style={{ color: 'var(--color-text)' }}
            >
              {result.rounds} 轮
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1" aria-hidden="true">⏱️</div>
            <p
              className="text-xs"
              style={{ color: 'var(--color-text-hint)' }}
            >
              总时长
            </p>
            <p
              className="text-sm font-bold mt-0.5"
              style={{ color: 'var(--color-text)' }}
            >
              {durationText}
            </p>
          </div>
        </div>

        {/* 数据已记录提示 */}
        <div
          className="flex items-center gap-2 p-3 rounded-xl"
          style={{ backgroundColor: 'var(--color-primary-light)' }}
        >
          <span className="text-lg" aria-hidden="true">📊</span>
          <p
            className="text-xs flex-1"
            style={{ color: 'var(--color-primary-dark)' }}
          >
            本次练习已记录到你的成长档案
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-surface)',
            }}
            aria-label="关闭弹窗"
          >
            关闭
          </button>
          <button
            type="button"
            onClick={onViewGrowth}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              color: 'var(--color-primary)',
              backgroundColor: 'var(--color-primary-light)',
            }}
            aria-label="查看成长档案"
          >
            📈 查看档案
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-primary)' }}
            aria-label="再来一次"
          >
            🔄 再来一次
          </button>
        </div>
      </div>
    </Modal>
  );
}
