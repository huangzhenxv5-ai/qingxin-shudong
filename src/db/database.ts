import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { User, EmotionEntry } from '@/types';
import type { CardGameRecord } from '@/types/card';
import type { DailyCardRecord } from '@/types/dailyCard';
import type { BreathingRecord } from '@/types/breathing';

// 对话记录类型（预留）
export interface Conversation {
  id?: number;
  username: string;
  title: string;
  emotion?: string;
  createdAt: number;
  updatedAt: number;
}

// 消息类型（预留）
export interface Message {
  id?: number;
  conversationId: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

interface QingxinDB extends DBSchema {
  users: {
    key: string;
    value: User;
  };
  emotion_entries: {
    key: number;
    value: EmotionEntry;
    indexes: { 'by-username': string; 'by-date': string };
  };
  conversations: {
    key: number;
    value: Conversation;
    indexes: { 'by-username': string };
  };
  messages: {
    key: number;
    value: Message;
    indexes: { 'by-conversation': number };
  };
  card_games: {
    key: number;
    value: CardGameRecord;
    indexes: { 'by-username': string };
  };
  daily_cards: {
    key: number;
    value: DailyCardRecord;
    indexes: { 'by-username': string; 'by-date': string };
  };
  breathing_records: {
    key: number;
    value: BreathingRecord;
    indexes: { 'by-username': string };
  };
}

const DB_NAME = 'qingxin_shudong_db';
const DB_VERSION = 4;

let dbInstance: IDBPDatabase<QingxinDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<QingxinDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<QingxinDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // 用户表
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'username' });
      }
      // 情绪日记表
      if (!db.objectStoreNames.contains('emotion_entries')) {
        const store = db.createObjectStore('emotion_entries', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-username', 'username');
        store.createIndex('by-date', 'date');
      }
      // 对话表（预留）
      if (!db.objectStoreNames.contains('conversations')) {
        const store = db.createObjectStore('conversations', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-username', 'username');
      }
      // 消息表（预留）
      if (!db.objectStoreNames.contains('messages')) {
        const store = db.createObjectStore('messages', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-conversation', 'conversationId');
      }
      // v2: 删除旧 monsters store（若存在），创建 card_games store
      const storeNames = Array.from(db.objectStoreNames) as string[];
      if (storeNames.includes('monsters')) {
        (db as unknown as { deleteObjectStore: (name: string) => void }).deleteObjectStore('monsters');
      }
      if (!db.objectStoreNames.contains('card_games')) {
        const store = db.createObjectStore('card_games', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-username', 'username');
      }
      // v3: 情绪日签记录表
      if (oldVersion < 3 && !db.objectStoreNames.contains('daily_cards')) {
        const store = db.createObjectStore('daily_cards', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-username', 'username');
        store.createIndex('by-date', 'date');
      }
      // v4: 呼吸练习记录表
      if (oldVersion < 4 && !db.objectStoreNames.contains('breathing_records')) {
        const store = db.createObjectStore('breathing_records', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-username', 'username');
      }
    },
  });

  return dbInstance;
}

// 数据库健康检查
export async function checkDBHealth(): Promise<boolean> {
  try {
    const db = await getDB();
    return db.objectStoreNames.length === 7;
  } catch {
    return false;
  }
}
