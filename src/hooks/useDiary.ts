import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  upsertEmotionEntry,
  getTodayEntry,
  getAllEntriesByUsername,
  getRecentEntries,
  hasCheckedInToday,
} from '@/db/emotionStore';
import { detectCrisis } from '@/services/crisisDetection';
import type { EmotionEntry, EmotionKey } from '@/types';
import { EMOTIONS } from '@/types';
import { getToday } from '@/utils/date';

export function useDiary() {
  const username = useAuthStore((s) => s.username);
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<EmotionEntry | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载所有日记
  const loadEntries = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    try {
      const all = await getAllEntriesByUsername(username);
      setEntries(all);
      const today = await getTodayEntry(username);
      setTodayEntry(today ?? null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // 打卡（含危机检测）
  const checkIn = useCallback(
    async (emotion: EmotionKey, note: string): Promise<{ crisis: boolean }> => {
      if (!username) throw new Error('未登录');
      const crisis = detectCrisis(note);
      const config = EMOTIONS[emotion];
      await upsertEmotionEntry({
        username,
        emotion,
        score: config.score,
        note,
        date: getToday(),
      });
      await loadEntries();
      return { crisis };
    },
    [username, loadEntries],
  );

  // 是否已打卡
  const hasCheckedIn = useCallback(async (): Promise<boolean> => {
    if (!username) return false;
    return hasCheckedInToday(username);
  }, [username]);

  // 获取近 N 天数据
  const getRecent = useCallback(
    async (days: number): Promise<EmotionEntry[]> => {
      if (!username) return [];
      return getRecentEntries(username, days);
    },
    [username],
  );

  return {
    entries,
    todayEntry,
    loading,
    checkIn,
    hasCheckedIn,
    getRecent,
    reload: loadEntries,
  };
}
