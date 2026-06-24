import type { BreathingMode, BreathingModeConfig } from '@/types/breathing';

// 三种呼吸模式配置
// 配色规范：
// - 吸气：暖橙色渐变（能量上升）
// - 屏息：暖橙色保持（能量积蓄）
// - 呼气：冷蓝色渐变（能量释放）
// - 盒式呼吸的二次屏息：冷蓝色保持
export const BREATHING_MODES: Record<BreathingMode, BreathingModeConfig> = {
  // 4-7-8 放松模式：4 秒吸气 → 7 秒屏息 → 8 秒呼气（单轮 19 秒）
  '4-7-8': {
    id: '4-7-8',
    name: '4-7-8 放松',
    description: '吸气 4 秒，屏息 7 秒，呼气 8 秒',
    icon: '🌙',
    phases: [
      {
        type: 'inhale',
        duration: 4,
        label: '吸气',
        scaleFrom: 0.5,
        scaleTo: 1.2,
        bgColor: '#FFB74D',
        accentColor: '#FF9800',
      },
      {
        type: 'hold',
        duration: 7,
        label: '屏息',
        scaleFrom: 1.2,
        scaleTo: 1.2,
        bgColor: '#FFA726',
        accentColor: '#FB8C00',
      },
      {
        type: 'exhale',
        duration: 8,
        label: '呼气',
        scaleFrom: 1.2,
        scaleTo: 0.5,
        bgColor: '#64B5F6',
        accentColor: '#42A5F5',
      },
    ],
    roundDuration: 19,
    recommendedRounds: 4,
    scene: '考前紧张、失眠焦虑、需要深度放松',
  },
  // 等长呼吸模式：4-4-4（单轮 12 秒）
  equal: {
    id: 'equal',
    name: '等长呼吸',
    description: '吸气 4 秒，屏息 4 秒，呼气 4 秒',
    icon: '⚖️',
    phases: [
      {
        type: 'inhale',
        duration: 4,
        label: '吸气',
        scaleFrom: 0.5,
        scaleTo: 1.2,
        bgColor: '#FFB74D',
        accentColor: '#FF9800',
      },
      {
        type: 'hold',
        duration: 4,
        label: '屏息',
        scaleFrom: 1.2,
        scaleTo: 1.2,
        bgColor: '#FFA726',
        accentColor: '#FB8C00',
      },
      {
        type: 'exhale',
        duration: 4,
        label: '呼气',
        scaleFrom: 1.2,
        scaleTo: 0.5,
        bgColor: '#64B5F6',
        accentColor: '#42A5F5',
      },
    ],
    roundDuration: 12,
    recommendedRounds: 4,
    scene: '日常调节、情绪平稳、专注力训练',
  },
  // 盒式呼吸模式：3-3-3-3（单轮 12 秒）
  box: {
    id: 'box',
    name: '盒式呼吸',
    description: '吸气 3 秒，屏息 3 秒，呼气 3 秒，屏息 3 秒',
    icon: '📦',
    phases: [
      {
        type: 'inhale',
        duration: 3,
        label: '吸气',
        scaleFrom: 0.5,
        scaleTo: 1.2,
        bgColor: '#FFB74D',
        accentColor: '#FF9800',
      },
      {
        type: 'hold',
        duration: 3,
        label: '屏息',
        scaleFrom: 1.2,
        scaleTo: 1.2,
        bgColor: '#FFA726',
        accentColor: '#FB8C00',
      },
      {
        type: 'exhale',
        duration: 3,
        label: '呼气',
        scaleFrom: 1.2,
        scaleTo: 0.5,
        bgColor: '#64B5F6',
        accentColor: '#42A5F5',
      },
      {
        type: 'hold-after-exhale',
        duration: 3,
        label: '屏息',
        scaleFrom: 0.5,
        scaleTo: 0.5,
        bgColor: '#90CAF9',
        accentColor: '#64B5F6',
      },
    ],
    roundDuration: 12,
    recommendedRounds: 4,
    scene: '压力管理、专注提升、特种部队减压法',
  },
};

// 模式列表（用于选择区展示）
export const BREATHING_MODE_LIST: BreathingModeConfig[] = [
  BREATHING_MODES['4-7-8'],
  BREATHING_MODES.equal,
  BREATHING_MODES.box,
];

// 可选轮数
export const ROUND_OPTIONS = [2, 4, 6] as const;

// 根据模式 ID 获取配置
export function getBreathingMode(id: BreathingMode): BreathingModeConfig {
  return BREATHING_MODES[id];
}

// 鼓励语文案库（完成后随机展示）
export const ENCOURAGEMENT_QUOTES: string[] = [
  '做得很好，每一次呼吸都是对自己的温柔关照。',
  '你刚刚为自己腾出了一片宁静的空间，真棒！',
  '呼吸是锚，让你在情绪的浪潮中保持稳定。',
  '你已经完成了今天的呼吸练习，为自己点赞吧。',
  '平静的力量正在你体内慢慢积蓄，继续坚持。',
  '每一次专注的呼吸，都是送给自己最好的礼物。',
  '你正在学习与自己的情绪和平相处，这很了不起。',
  '短暂的停顿，是为了更好地前行。',
  '你已经掌握了调节情绪的工具，随时可以使用。',
  '允许自己慢下来，是一种智慧。',
];

// 获取随机鼓励语
export function getRandomEncouragement(): string {
  return ENCOURAGEMENT_QUOTES[Math.floor(Math.random() * ENCOURAGEMENT_QUOTES.length)];
}
