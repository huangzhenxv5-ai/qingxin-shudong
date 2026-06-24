import { getDB } from './database';
import type { BreathingRecord, BreathingMode, BreathingStats } from '@/types/breathing';

// 记录一次呼吸练习
export async function recordBreathing(
  record: Omit<BreathingRecord, 'id' | 'completedAt'>,
): Promise<number> {
  const db = await getDB();
  const newRecord: BreathingRecord = { ...record, completedAt: Date.now() };
  return (await db.add('breathing_records', newRecord)) as number;
}

// 获取用户所有呼吸练习记录（按时间倒序）
export async function getBreathingRecordsByUsername(
  username: string,
): Promise<BreathingRecord[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('breathing_records', 'by-username', username);
  return all.sort((a, b) => b.completedAt - a.completedAt);
}

// 获取用户呼吸练习统计
export async function getBreathingStats(username: string): Promise<BreathingStats> {
  const records = await getBreathingRecordsByUsername(username);
  const totalCount = records.length;
  const totalDuration = records.reduce((sum, r) => sum + r.duration, 0);
  const totalRounds = records.reduce((sum, r) => sum + r.rounds, 0);
  const lastPracticeAt = records[0]?.completedAt;

  const modeDistribution: Record<BreathingMode, number> = {
    '4-7-8': 0,
    equal: 0,
    box: 0,
  };
  records.forEach((r) => {
    modeDistribution[r.mode] += 1;
  });

  return {
    totalCount,
    totalDuration,
    totalRounds,
    lastPracticeAt,
    modeDistribution,
  };
}

// 获取用户呼吸练习总次数
export async function getBreathingCount(username: string): Promise<number> {
  const records = await getBreathingRecordsByUsername(username);
  return records.length;
}

// 获取最近一次呼吸练习
export async function getLatestBreathing(
  username: string,
): Promise<BreathingRecord | undefined> {
  const records = await getBreathingRecordsByUsername(username);
  return records[0];
}

// 删除呼吸练习记录
export async function deleteBreathingRecord(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('breathing_records', id);
}
