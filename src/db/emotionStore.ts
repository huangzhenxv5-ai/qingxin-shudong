import { getDB } from './database';
import type { EmotionEntry } from '@/types';
import { getToday } from '@/utils/date';

// 创建或更新情绪记录（按日期去重：同一天覆盖）
export async function upsertEmotionEntry(entry: Omit<EmotionEntry, 'id' | 'createdAt'>): Promise<number> {
  const db = await getDB();
  const existing = await getEntryByUsernameAndDate(entry.username, entry.date);

  if (existing && existing.id !== undefined) {
    await db.put('emotion_entries', { ...existing, ...entry, id: existing.id });
    return existing.id;
  }

  const newEntry: EmotionEntry = { ...entry, createdAt: Date.now() };
  return (await db.add('emotion_entries', newEntry)) as number;
}

// 查询用户某天的记录
export async function getEntryByUsernameAndDate(username: string, date: string): Promise<EmotionEntry | undefined> {
  const db = await getDB();
  const tx = db.transaction('emotion_entries', 'readonly');
  const index = tx.store.index('by-username');
  let result: EmotionEntry | undefined;
  let cursor = await index.openCursor(username);
  while (cursor) {
    if (cursor.value.date === date) {
      result = cursor.value;
      break;
    }
    cursor = await cursor.continue();
  }
  await tx.done;
  return result;
}

// 查询用户今日是否已打卡
export async function hasCheckedInToday(username: string): Promise<boolean> {
  const entry = await getEntryByUsernameAndDate(username, getToday());
  return !!entry;
}

// 查询用户今日打卡记录
export async function getTodayEntry(username: string): Promise<EmotionEntry | undefined> {
  return getEntryByUsernameAndDate(username, getToday());
}

// 查询用户所有情绪记录（按日期倒序）
export async function getAllEntriesByUsername(username: string): Promise<EmotionEntry[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('emotion_entries', 'by-username', username);
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

// 查询近 N 天的情绪记录
export async function getRecentEntries(username: string, days: number): Promise<EmotionEntry[]> {
  const all = await getAllEntriesByUsername(username);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;
  return all.filter((e) => e.date >= cutoffStr);
}

// 删除情绪记录
export async function deleteEmotionEntry(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('emotion_entries', id);
}
