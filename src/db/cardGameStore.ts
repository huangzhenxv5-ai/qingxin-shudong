import { getDB } from './database';
import type { CardGameRecord } from '@/types/card';

// 记录一局卡牌配对游戏结果
export async function recordCardGame(
  game: Omit<CardGameRecord, 'id' | 'completedAt'>,
): Promise<number> {
  const db = await getDB();
  const newGame: CardGameRecord = { ...game, completedAt: Date.now() };
  return (await db.add('card_games', newGame)) as number;
}

// 获取用户所有游戏记录（按时间倒序）
export async function getGamesByUsername(username: string): Promise<CardGameRecord[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('card_games', 'by-username', username);
  return all.sort((a, b) => b.completedAt - a.completedAt);
}

// 获取用户总完成局数
export async function getTotalGameCount(username: string): Promise<number> {
  const games = await getGamesByUsername(username);
  return games.length;
}

// 获取用户最近一次游戏记录
export async function getLatestGame(username: string): Promise<CardGameRecord | undefined> {
  const games = await getGamesByUsername(username);
  return games[0];
}

// 获取最佳记录（最少步数）
export async function getBestGame(username: string): Promise<CardGameRecord | undefined> {
  const games = await getGamesByUsername(username);
  if (games.length === 0) return undefined;
  return games.reduce((best, current) =>
    current.moves < best.moves ? current : best,
  );
}
