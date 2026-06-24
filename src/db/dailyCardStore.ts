import { getDB } from './database';
import type { DailyCardRecord } from '@/types/dailyCard';
import { getToday } from '@/utils/date';

// 创建或更新日签记录（按日期去重：同一天覆盖）
export async function upsertDailyCard(
  card: Omit<DailyCardRecord, 'id' | 'createdAt'>,
): Promise<number> {
  const db = await getDB();
  const existing = await getDailyCardByUsernameAndDate(card.username, card.date);

  if (existing && existing.id !== undefined) {
    await db.put('daily_cards', { ...existing, ...card, id: existing.id });
    return existing.id;
  }

  const newCard: DailyCardRecord = { ...card, createdAt: Date.now() };
  return (await db.add('daily_cards', newCard)) as number;
}

// 查询用户某天的日签
export async function getDailyCardByUsernameAndDate(
  username: string,
  date: string,
): Promise<DailyCardRecord | undefined> {
  const db = await getDB();
  const tx = db.transaction('daily_cards', 'readonly');
  const index = tx.store.index('by-username');
  let result: DailyCardRecord | undefined;
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

// 查询用户今日日签
export async function getTodayDailyCard(username: string): Promise<DailyCardRecord | undefined> {
  return getDailyCardByUsernameAndDate(username, getToday());
}

// 查询用户所有日签（按日期倒序）
export async function getAllDailyCardsByUsername(username: string): Promise<DailyCardRecord[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('daily_cards', 'by-username', username);
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

// 查询近 N 天的日签
export async function getRecentDailyCards(
  username: string,
  days: number,
): Promise<DailyCardRecord[]> {
  const all = await getAllDailyCardsByUsername(username);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;
  return all.filter((c) => c.date >= cutoffStr);
}

// 删除日签记录
export async function deleteDailyCard(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('daily_cards', id);
}

// 获取用户日签总数
export async function getDailyCardCount(username: string): Promise<number> {
  const all = await getAllDailyCardsByUsername(username);
  return all.length;
}
