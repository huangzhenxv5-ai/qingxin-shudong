import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { generateMonthlySummary } from '@/services/growthSummary';
import type { GrowthProfile, MonthlySummary } from '@/types/growth';

interface AIMonthlySummaryProps {
  profile: GrowthProfile;
}

// AI 月度小结区：调用 LLM 生成鼓励性月度总结
export function AIMonthlySummary({ profile }: AIMonthlySummaryProps) {
  const { showToast } = useToast();
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateMonthlySummary(profile);
      setSummary(result);
      showToast('月度小结已生成', 'success');
    } catch {
      showToast('生成失败，请稍后再试', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-label="AI 月度小结">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
          AI 月度小结
        </h3>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50 min-h-[44px] md:min-h-[32px] whitespace-nowrap"
          style={{ backgroundColor: 'var(--color-primary)' }}
          aria-label={summary ? '重新生成月度小结' : '生成月度小结'}
        >
          {loading ? '生成中...' : summary ? '🔄 重新生成' : '✨ 生成小结'}
        </button>
      </div>

      {loading ? (
        <div
          className="rounded-xl p-5 flex items-center gap-3"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <div
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"
            style={{ color: 'var(--color-primary)' }}
            aria-hidden="true"
          />
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            AI 正在分析你的情绪数据，生成专属小结...
          </p>
        </div>
      ) : summary ? (
        <div
          className="rounded-xl p-5"
          style={{
            background:
              'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-card) 100%)',
            border: '1px solid var(--color-primary)',
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0" aria-hidden="true">💚</span>
            <div className="flex-1">
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-text)' }}
              >
                {summary.content}
              </p>
              <p
                className="text-xs mt-3"
                style={{ color: 'var(--color-text-hint)' }}
              >
                生成于 {summary.period} · 由 AI 基于你的情绪数据生成
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl p-5 text-center"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <span className="text-3xl block mb-2" aria-hidden="true">📝</span>
          <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            让 AI 为你生成一份月度情绪成长小结
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-hint)' }}>
            基于你的日记、倾诉、卡牌、日签数据综合分析
          </p>
        </div>
      )}
    </section>
  );
}
