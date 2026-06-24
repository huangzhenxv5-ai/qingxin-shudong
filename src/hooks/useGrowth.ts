import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getAllEntriesByUsername, getRecentEntries } from '@/db/emotionStore';
import { getConversationsByUsername } from '@/db/conversationStore';
import { getGamesByUsername } from '@/db/cardGameStore';
import { getAllDailyCardsByUsername } from '@/db/dailyCardStore';
import { getBreathingRecordsByUsername } from '@/db/breathingStore';
import { getUserByUsername } from '@/db/userStore';
import { EMOTIONS, type EmotionKey } from '@/types';
import type {
  GrowthProfile,
  EmotionDistribution,
  EmotionTrendPoint,
  UsageStat,
} from '@/types/growth';
import type { Achievement } from '@/types/card';
import { getRecentDays, formatDate } from '@/utils/date';

// 成就定义
const ACHIEVEMENT_DEFS: { id: string; name: string; description: string; icon: string; check: (p: GrowthProfile) => boolean }[] = [
  { id: 'first-diary', name: '初次记录', description: '写下第一篇情绪日记', icon: '✍️', check: (p) => p.diaryCount >= 1 },
  { id: 'diary-7', name: '坚持一周', description: '累计记录 7 篇日记', icon: '📅', check: (p) => p.diaryCount >= 7 },
  { id: 'diary-30', name: '月度达人', description: '累计记录 30 篇日记', icon: '🗓️', check: (p) => p.diaryCount >= 30 },
  { id: 'first-chat', name: '敞开心扉', description: '第一次与树洞倾诉', icon: '💬', check: (p) => p.chatCount >= 1 },
  { id: 'chat-10', name: '倾诉能手', description: '累计倾诉 10 次', icon: '🗣️', check: (p) => p.chatCount >= 10 },
  { id: 'first-card', name: '卡牌新手', description: '完成第一局卡牌配对', icon: '🃏', check: (p) => p.cardGameCount >= 1 },
  { id: 'card-5', name: '卡牌高手', description: '完成 5 局卡牌配对', icon: '🎯', check: (p) => p.cardGameCount >= 5 },
  { id: 'first-card-daily', name: '日签收藏家', description: '生成第一张情绪日签', icon: '🎴', check: (p) => p.dailyCardCount >= 1 },
  { id: 'card-daily-7', name: '日签达人', description: '生成 7 张情绪日签', icon: '🖼️', check: (p) => p.dailyCardCount >= 7 },
  { id: 'first-breathing', name: '深呼吸', description: '完成第一次呼吸练习', icon: '🌬️', check: (p) => p.breathingCount >= 1 },
  { id: 'breathing-5', name: '呼吸达人', description: '完成 5 次呼吸练习', icon: '🧘', check: (p) => p.breathingCount >= 5 },
  { id: 'streak-3', name: '连续打卡', description: '连续 3 天记录情绪', icon: '🔥', check: (p) => p.streakDays >= 3 },
  { id: 'streak-7', name: '坚持之星', description: '连续 7 天记录情绪', icon: '⭐', check: (p) => p.streakDays >= 7 },
  { id: 'all-rounder', name: '全面发展', description: '使用过所有功能', icon: '🌈', check: (p) => p.diaryCount > 0 && p.chatCount > 0 && p.cardGameCount > 0 && p.dailyCardCount > 0 && p.breathingCount > 0 },
];

export function useGrowth() {
  const username = useAuthStore((s) => s.username);
  const [profile, setProfile] = useState<GrowthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendRange, setTrendRange] = useState<7 | 30 | 90>(30);

  // 计算连续打卡天数
  const calculateStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0;
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    const today = formatDate(new Date());
    // 若今日未打卡，从昨天开始算
    let cursor = sorted[0] === today ? new Date() : new Date(Date.now() - 86400000);
    let streak = 0;
    const dateSet = new Set(sorted);
    while (dateSet.has(formatDate(cursor))) {
      streak += 1;
      cursor = new Date(cursor.getTime() - 86400000);
    }
    return streak;
  };

  // 聚合所有数据
  const loadProfile = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    try {
      const [entries, conversations, games, dailyCards, breathingRecords, user] = await Promise.all([
        getAllEntriesByUsername(username),
        getConversationsByUsername(username),
        getGamesByUsername(username),
        getAllDailyCardsByUsername(username),
        getBreathingRecordsByUsername(username),
        getUserByUsername(username),
      ]);

      const diaryCount = entries.length;
      const chatCount = conversations.length;
      const cardGameCount = games.length;
      const dailyCardCount = dailyCards.length;
      const breathingCount = breathingRecords.length;
      const totalInteractions = diaryCount + chatCount + cardGameCount + dailyCardCount + breathingCount;

      // 注册天数
      const registerDays = user
        ? Math.max(1, Math.floor((Date.now() - user.createdAt) / 86400000))
        : 1;

      // 情绪分布
      const emotionCounts = new Map<EmotionKey, number>();
      entries.forEach((e) => {
        emotionCounts.set(e.emotion, (emotionCounts.get(e.emotion) || 0) + 1);
      });
      const emotionDistribution: EmotionDistribution[] = (Object.keys(EMOTIONS) as EmotionKey[])
        .map((emotion) => {
          const count = emotionCounts.get(emotion) || 0;
          return {
            emotion,
            count,
            percentage: diaryCount > 0 ? Math.round((count / diaryCount) * 100) : 0,
          };
        })
        .filter((d) => d.count > 0)
        .sort((a, b) => b.count - a.count);

      // 情绪趋势（按 trendRange）
      const trendEntries = await getRecentEntries(username, trendRange);
      const recentDays = getRecentDays(trendRange);
      const scoreMap = new Map<string, { score: number; emotion: EmotionKey }>();
      trendEntries.forEach((e) => scoreMap.set(e.date, { score: e.score, emotion: e.emotion }));
      const emotionTrend: EmotionTrendPoint[] = recentDays.map((date) => {
        const data = scoreMap.get(date);
        return {
          date,
          score: data?.score ?? null,
          emotion: data?.emotion,
        };
      });

      // 情绪日历（全部记录）
      const emotionCalendar = entries
        .map((e) => ({ date: e.date, score: e.score, emotion: e.emotion }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // 功能使用统计
      const usageStats: UsageStat[] = [
        { key: 'diary', label: '情绪日记', icon: '📔', count: diaryCount, color: 'var(--color-caution)' },
        { key: 'chat', label: '树洞倾诉', icon: '💬', count: chatCount, color: 'var(--color-secondary)' },
        { key: 'card', label: '卡牌配对', icon: '🃏', count: cardGameCount, color: 'var(--color-primary)' },
        { key: 'dailyCard', label: '情绪日签', icon: '🎴', count: dailyCardCount, color: 'var(--color-warning)' },
        { key: 'breathing', label: '呼吸练习', icon: '🌬️', count: breathingCount, color: '#64B5F6' },
      ];

      // 平均分
      const avgScore = entries.length > 0
        ? Number((entries.reduce((sum, e) => sum + e.score, 0) / entries.length).toFixed(2))
        : 0;

      // 连续打卡
      const streakDays = calculateStreak(entries.map((e) => e.date));

      // 构建临时 profile 用于成就计算
      const tempProfile: GrowthProfile = {
        username,
        registerDays,
        totalInteractions,
        diaryCount,
        chatCount,
        cardGameCount,
        dailyCardCount,
        breathingCount,
        emotionDistribution,
        emotionTrend,
        emotionCalendar,
        usageStats,
        achievements: [],
        avgScore,
        streakDays,
      };

      // 成就
      const achievements: Achievement[] = ACHIEVEMENT_DEFS.map((def) => ({
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        unlocked: def.check(tempProfile),
        unlockedAt: def.check(tempProfile) ? Date.now() : undefined,
      }));

      setProfile({ ...tempProfile, achievements });
    } finally {
      setLoading(false);
    }
  }, [username, trendRange]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    trendRange,
    setTrendRange,
    reload: loadProfile,
  };
}
