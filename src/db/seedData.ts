/**
 * 预设账号与测试数据初始化
 *
 * 预设账号：demo / demo123
 *
 * 启动应用时自动检查，若预设账号不存在则创建并填充测试数据：
 * - 14 天情绪日记（多样化情绪）
 * - 7 天日签记录
 * - 4 次呼吸练习记录
 * - 3 次卡牌游戏记录
 * - 1 个 AI 树洞对话（含消息）
 */
import { getDB } from './database';
import { getUserByUsername, createUser } from './userStore';
import { hashPassword } from '@/utils/crypto';
import { createConversation, addMessage } from './conversationStore';
import { getTemplateByEmotion, getEmotionLabel } from '@/constants/dailyCardTemplates';
import type { EmotionKey } from '@/types/emotion';
import type { BreathingMode } from '@/types/breathing';
import type { User } from '@/types';

// 预设账号配置
export const SEED_USERNAME = 'demo';
const SEED_PASSWORD = 'demo123';
const SEED_FLAG_KEY = 'qingxin_seed_done';

// 生成最近第 n 天的日期字符串（n=0 表示今天）
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 生成最近第 n 天的时间戳（带小时偏移，避免全部同一时刻）
function tsDaysAgo(n: number, hour = 10): number {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  return d.getTime();
}

// 情绪日记测试数据（最近 14 天）
const EMOTION_DIARY_SEED: Array<{
  emotion: EmotionKey;
  note: string;
  offset: number;
}> = [
  { emotion: 'happy', note: '今天数学考试拿了 95 分，努力终于有回报了！', offset: 0 },
  { emotion: 'calm', note: '下午在图书馆看书，安静的氛围让人很放松。', offset: 1 },
  { emotion: 'normal', note: '普通的一天，上课、写作业，没什么特别的事。', offset: 2 },
  { emotion: 'anxious', note: '明天要演讲，有点紧张，怕忘词。', offset: 3 },
  { emotion: 'happy', note: '和好朋友一起吃了午饭，聊得很开心。', offset: 4 },
  { emotion: 'low', note: '今天有点累，感觉做什么都提不起劲。', offset: 5 },
  { emotion: 'calm', note: '放学后去操场跑了会儿步，心情平静了许多。', offset: 6 },
  { emotion: 'sad', note: '和好朋友闹了点矛盾，心里有点难过。', offset: 7 },
  { emotion: 'happy', note: '收到了心仪大学的宣传册，对未来充满期待！', offset: 8 },
  { emotion: 'anxious', note: '期末考试快到了，复习进度有点慢，有些焦虑。', offset: 9 },
  { emotion: 'normal', note: '今天参加了社团活动，还算有趣。', offset: 10 },
  { emotion: 'calm', note: '晚上听了会儿轻音乐，感觉很治愈。', offset: 11 },
  { emotion: 'low', note: '天气阴沉沉的，心情也跟着低落了。', offset: 12 },
  { emotion: 'happy', note: '老师表扬了我的作文，一整天都很开心！', offset: 13 },
];

// 日签治愈文案（按情绪匹配）
const QUOTE_MAP: Record<EmotionKey, string[]> = {
  happy: ['阳光正好，微风不燥，愿你的笑容如今天般灿烂。', '每一份努力都会开花，今天的你值得所有美好。'],
  calm: ['心若安静，世界便不喧嚣。愿这份宁静陪你走很远。', '在平淡的日子里，也能找到属于自己的小确幸。'],
  normal: ['普通的一天也有它的温度，慢慢走，总会到远方。', '不必每天都闪闪发光，安稳本身就是一种力量。'],
  low: ['乌云散去后，天空依然属于你。给自己一点时间。', '低落也没关系，情绪会流动，你也会重新轻盈。'],
  anxious: ['紧张说明你在乎，深呼吸，你已经准备得很好了。', '未来一步步走来，不必把所有担忧都扛在今天。'],
  sad: ['难过的时候，就允许自己难过一会儿。我在这里陪你。', '眼泪流过后，心会变得更柔软也更坚强。'],
};

// 呼吸练习记录
const BREATHING_SEED: Array<{
  mode: BreathingMode;
  rounds: number;
  duration: number;
  offset: number;
}> = [
  { mode: '4-7-8', rounds: 4, duration: 76, offset: 1 },
  { mode: 'equal', rounds: 6, duration: 72, offset: 3 },
  { mode: 'box', rounds: 4, duration: 48, offset: 5 },
  { mode: '4-7-8', rounds: 2, duration: 38, offset: 6 },
];

// 卡牌游戏记录
const CARD_GAME_SEED: Array<{
  matchedPairs: number;
  totalPairs: number;
  moves: number;
  duration: number;
  offset: number;
}> = [
  { matchedPairs: 6, totalPairs: 6, moves: 18, duration: 95, offset: 2 },
  { matchedPairs: 6, totalPairs: 6, moves: 22, duration: 120, offset: 4 },
  { matchedPairs: 4, totalPairs: 6, moves: 15, duration: 60, offset: 7 },
];

// AI 树洞对话
const CHAT_SEED: Array<{ role: 'user' | 'assistant'; content: string }> = [
  { role: 'user', content: '今天考试没考好，觉得自己很没用。' },
  { role: 'assistant', content: '抱抱你。一次考试的失利并不代表你的价值，它只是漫长学习路上的一个小插曲。你愿意为成绩难过，说明你在乎、在努力。允许自己失落一会儿，然后拍拍灰尘继续走，明天又是崭新的开始。' },
  { role: 'user', content: '可是我已经努力了，为什么还是考不好？' },
  { role: 'assistant', content: '努力了却没有立刻看到结果，这种感觉确实很难受。但请相信，努力从来不会白费——它可能在另一个时刻以另一种方式回报你。也许可以试着和老师聊聊，看看哪里可以调整学习方法。你已经很棒了，别太苛责自己。' },
];

/**
 * 初始化预设账号与测试数据
 * 幂等：通过 localStorage 标记 + 用户存在检查，避免重复创建
 */
export async function seedDemoData(): Promise<void> {
  // 已初始化过则跳过（同一浏览器环境）
  if (localStorage.getItem(SEED_FLAG_KEY) === SEED_USERNAME) return;

  // 若预设账号已存在（用户手动注册过 demo），则不覆盖
  const existing = await getUserByUsername(SEED_USERNAME);
  if (existing) {
    localStorage.setItem(SEED_FLAG_KEY, SEED_USERNAME);
    return;
  }

  // 1. 创建预设账号
  const passwordHash = await hashPassword(SEED_PASSWORD);
  const now = Date.now();
  const user: User = {
    username: SEED_USERNAME,
    passwordHash,
    nickname: '体验官',
    avatar: '🌿',
    createdAt: tsDaysAgo(14, 9),
    lastLoginAt: now,
  };
  await createUser(user);

  // 2. 情绪日记（14 天）
  const db = await getDB();
  for (const item of EMOTION_DIARY_SEED) {
    const scoreMap: Record<EmotionKey, number> = {
      happy: 5, calm: 4, normal: 3, low: 2, anxious: 1, sad: 1,
    };
    await db.add('emotion_entries', {
      username: SEED_USERNAME,
      emotion: item.emotion,
      score: scoreMap[item.emotion],
      note: item.note,
      date: daysAgo(item.offset),
      createdAt: tsDaysAgo(item.offset, 20),
    });
  }

  // 3. 日签记录（最近 7 天，跳过今天，今天留给用户自己生成体验）
  for (let offset = 1; offset <= 7; offset++) {
    const diary = EMOTION_DIARY_SEED.find((d) => d.offset === offset);
    const emotion = diary?.emotion ?? 'calm';
    const template = getTemplateByEmotion(emotion);
    const quotes = QUOTE_MAP[emotion];
    const quote = quotes[offset % quotes.length];
    await db.add('daily_cards', {
      username: SEED_USERNAME,
      date: daysAgo(offset),
      emotion,
      quote,
      template: template.id,
      emotionLabel: getEmotionLabel(emotion),
      imageUrl: undefined,
      createdAt: tsDaysAgo(offset, 21),
    });
  }

  // 4. 呼吸练习记录
  for (const item of BREATHING_SEED) {
    await db.add('breathing_records', {
      username: SEED_USERNAME,
      mode: item.mode,
      rounds: item.rounds,
      duration: item.duration,
      completedAt: tsDaysAgo(item.offset, 19),
    });
  }

  // 5. 卡牌游戏记录
  for (const item of CARD_GAME_SEED) {
    await db.add('card_games', {
      username: SEED_USERNAME,
      matchedPairs: item.matchedPairs,
      totalPairs: item.totalPairs,
      moves: item.moves,
      duration: item.duration,
      completedAt: tsDaysAgo(item.offset, 20),
    });
  }

  // 6. AI 树洞对话
  const convId = await createConversation(SEED_USERNAME, '考试失利的烦恼', 'sad');
  for (const msg of CHAT_SEED) {
    await addMessage(convId, msg.role, msg.content);
  }

  // 标记完成
  localStorage.setItem(SEED_FLAG_KEY, SEED_USERNAME);
}
