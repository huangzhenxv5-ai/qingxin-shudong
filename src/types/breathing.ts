// 呼吸放松练习类型定义

// 呼吸模式 ID
// - 4-7-8: 4 秒吸气 → 7 秒屏息 → 8 秒呼气（放松模式）
// - equal: 4 秒吸气 → 4 秒屏息 → 4 秒呼气（等长呼吸）
// - box: 3 秒吸气 → 3 秒屏息 → 3 秒呼气 → 3 秒屏息（盒式呼吸）
export type BreathingMode = '4-7-8' | 'equal' | 'box';

// 呼吸阶段
export type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'hold-after-exhale';

// 呼吸练习记录（存入 IndexedDB）
export interface BreathingRecord {
  id?: number;
  username: string;
  mode: BreathingMode;
  rounds: number; // 完成轮数
  duration: number; // 总时长（秒）
  completedAt: number; // 完成时间戳
}

// 呼吸阶段配置
export interface BreathingPhaseConfig {
  type: BreathingPhase;
  duration: number; // 持续时间（秒）
  label: string; // 显示文案，如「吸气」
  // 圆球缩放范围
  scaleFrom: number;
  scaleTo: number;
  // 背景色（暖色/冷色）
  bgColor: string;
  accentColor: string;
}

// 呼吸模式配置
export interface BreathingModeConfig {
  id: BreathingMode;
  name: string; // 模式名称
  description: string; // 模式描述
  icon: string; // 图标 emoji
  phases: BreathingPhaseConfig[]; // 阶段序列
  roundDuration: number; // 单轮时长（秒）
  recommendedRounds: number; // 推荐轮数
  scene: string; // 适用场景
}

// 呼吸练习统计
export interface BreathingStats {
  totalCount: number; // 累计练习次数
  totalDuration: number; // 累计练习时长（秒）
  totalRounds: number; // 累计完成轮数
  lastPracticeAt?: number; // 最近练习时间
  modeDistribution: Record<BreathingMode, number>; // 各模式使用次数
}
