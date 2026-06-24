import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { recordBreathing, getBreathingStats } from '@/db/breathingStore';
import {
  BREATHING_MODES,
  getRandomEncouragement,
} from '@/constants/breathing';
import type {
  BreathingMode,
  BreathingPhase,
  BreathingStats,
} from '@/types/breathing';

export type BreathingStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface BreathingState {
  status: BreathingStatus;
  mode: BreathingMode;
  rounds: number;
  currentRound: number; // 当前轮数（从 1 开始）
  currentPhaseIndex: number; // 当前阶段索引
  currentPhase: BreathingPhase;
  phaseLabel: string; // 阶段文案
  remainingSeconds: number; // 当前阶段剩余秒数
  totalElapsed: number; // 总累计秒数
  progress: number; // 当前阶段进度 0-1（用于圆球缩放）
  bgColor: string;
  accentColor: string;
}

interface BreathingResult {
  rounds: number;
  duration: number;
  encouragement: string;
}

export type { BreathingResult };

export function useBreathing() {
  const username = useAuthStore((s) => s.username);
  const [status, setStatus] = useState<BreathingStatus>('idle');
  const [mode, setMode] = useState<BreathingMode>('4-7-8');
  const [rounds, setRounds] = useState<number>(4);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BreathingResult | null>(null);
  const [stats, setStats] = useState<BreathingStats | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // 内部 ref：用于精确计时
  const phaseStartRef = useRef<number>(0); // 当前阶段开始时间戳
  const phaseElapsedBeforePauseRef = useRef<number>(0); // 暂停时已过毫秒
  const totalElapsedRef = useRef<number>(0); // 总累计毫秒
  const totalStartRef = useRef<number>(0); // 总开始时间戳
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastPhaseRef = useRef<BreathingPhase | null>(null);

  const modeConfig = BREATHING_MODES[mode];
  const currentPhase = modeConfig.phases[currentPhaseIndex] ?? modeConfig.phases[0];

  // ============ 音效（Web Audio API 生成轻柔正弦波）============
  const playPhaseSound = useCallback(
    (phase: BreathingPhase) => {
      if (!soundEnabled) return;
      try {
        if (!audioCtxRef.current) {
          const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioCtxRef.current = new Ctx();
        }
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        // 不同阶段不同音调
        const freq = phase === 'inhale' ? 523.25 : phase === 'exhale' ? 392.0 : 440.0;
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } catch {
        // 音频不可用时静默忽略
      }
    },
    [soundEnabled],
  );

  // ============ 阶段推进逻辑 ============
  const advancePhase = useCallback(() => {
    const phases = BREATHING_MODES[mode].phases;
    let nextPhaseIndex = currentPhaseIndex + 1;
    let nextRound = currentRound;

    if (nextPhaseIndex >= phases.length) {
      // 进入下一轮
      nextPhaseIndex = 0;
      nextRound += 1;
      if (nextRound > rounds) {
        // 完成所有轮数
        const duration = Math.round(totalElapsedRef.current / 1000);
        setStatus('completed');
        setResult({
          rounds,
          duration,
          encouragement: getRandomEncouragement(),
        });
        // 写入 IndexedDB
        if (username) {
          recordBreathing({
            username,
            mode,
            rounds,
            duration,
          }).catch(() => {
            // 写入失败静默处理
          });
        }
        return;
      }
      setCurrentRound(nextRound);
    }

    // 切换到下一阶段
    setCurrentPhaseIndex(nextPhaseIndex);
    const nextPhase = phases[nextPhaseIndex];
    setRemainingSeconds(nextPhase.duration);
    setProgress(0);
    phaseStartRef.current = Date.now();
    phaseElapsedBeforePauseRef.current = 0;
    if (nextPhase.type !== lastPhaseRef.current) {
      playPhaseSound(nextPhase.type);
      lastPhaseRef.current = nextPhase.type;
    }
  }, [currentPhaseIndex, currentRound, mode, rounds, username, playPhaseSound]);

  // ============ requestAnimationFrame 循环（更新倒计时和进度）============
  useEffect(() => {
    if (status !== 'running') return;

    const tick = () => {
      const phase = BREATHING_MODES[mode].phases[currentPhaseIndex];
      if (!phase) return;
      const elapsed = phaseElapsedBeforePauseRef.current + (Date.now() - phaseStartRef.current);
      const phaseDurationMs = phase.duration * 1000;
      const remainingMs = Math.max(0, phaseDurationMs - elapsed);
      const newRemaining = Math.ceil(remainingMs / 1000);
      const newProgress = Math.min(1, elapsed / phaseDurationMs);

      setRemainingSeconds(newRemaining);
      setProgress(newProgress);
      setTotalElapsed(Math.round((totalElapsedRef.current + Date.now() - totalStartRef.current) / 1000));

      if (remainingMs <= 0) {
        // 阶段结束，推进
        advancePhase();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [status, currentPhaseIndex, mode, advancePhase]);

  // ============ 控制：开始 ============
  const start = useCallback(() => {
    if (status === 'completed') {
      // 重新开始
      setCurrentRound(1);
      setCurrentPhaseIndex(0);
      setTotalElapsed(0);
      totalElapsedRef.current = 0;
      setResult(null);
    }
    const phase = BREATHING_MODES[mode].phases[0];
    setRemainingSeconds(phase.duration);
    setProgress(0);
    setCurrentRound(1);
    setCurrentPhaseIndex(0);
    phaseStartRef.current = Date.now();
    phaseElapsedBeforePauseRef.current = 0;
    totalStartRef.current = Date.now();
    totalElapsedRef.current = 0;
    lastPhaseRef.current = phase.type;
    setStatus('running');
    playPhaseSound(phase.type);
  }, [status, mode, playPhaseSound]);

  // ============ 控制：暂停 ============
  const pause = useCallback(() => {
    if (status !== 'running') return;
    // 记录当前阶段已过时间
    phaseElapsedBeforePauseRef.current += Date.now() - phaseStartRef.current;
    totalElapsedRef.current += Date.now() - totalStartRef.current;
    setStatus('paused');
  }, [status]);

  // ============ 控制：恢复 ============
  const resume = useCallback(() => {
    if (status !== 'paused') return;
    phaseStartRef.current = Date.now();
    totalStartRef.current = Date.now();
    setStatus('running');
  }, [status]);

  // ============ 控制：重置 ============
  const reset = useCallback(() => {
    setStatus('idle');
    setCurrentRound(1);
    setCurrentPhaseIndex(0);
    setRemainingSeconds(0);
    setProgress(0);
    setTotalElapsed(0);
    setResult(null);
    phaseStartRef.current = 0;
    phaseElapsedBeforePauseRef.current = 0;
    totalElapsedRef.current = 0;
    totalStartRef.current = 0;
    lastPhaseRef.current = null;
  }, []);

  // ============ 切换模式（仅在 idle 状态允许）============
  const changeMode = useCallback((newMode: BreathingMode) => {
    if (status !== 'idle') return;
    setMode(newMode);
    setRounds(BREATHING_MODES[newMode].recommendedRounds);
  }, [status]);

  // ============ 切换轮数（仅在 idle 状态允许）============
  const changeRounds = useCallback((newRounds: number) => {
    if (status !== 'idle') return;
    setRounds(newRounds);
  }, [status]);

  // ============ 切换音效 ============
  const toggleSound = useCallback(() => {
    setSoundEnabled((v) => !v);
  }, []);

  // ============ 加载统计 ============
  const loadStats = useCallback(async () => {
    if (!username) return;
    const s = await getBreathingStats(username);
    setStats(s);
  }, [username]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // 清理音频上下文
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  // 当前阶段配置
  const phaseConfig = currentPhase;
  const state: BreathingState = {
    status,
    mode,
    rounds,
    currentRound,
    currentPhaseIndex,
    currentPhase: phaseConfig.type,
    phaseLabel: phaseConfig.label,
    remainingSeconds,
    totalElapsed,
    progress,
    bgColor: phaseConfig.bgColor,
    accentColor: phaseConfig.accentColor,
  };

  return {
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
    reloadStats: loadStats,
  };
}
