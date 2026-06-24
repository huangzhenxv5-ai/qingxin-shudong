import { getDB } from '@/db/database';
import { getConversationsByUsername, getMessagesByConversation } from '@/db/conversationStore';
import type { User } from '@/types';

// 导出用户全部数据为 JSON 文件（数据备份功能）
export async function exportUserData(username: string): Promise<void> {
  const db = await getDB();
  // 带 by-username 索引的 store
  const indexedStores = ['emotion_entries', 'conversations', 'card_games', 'daily_cards', 'breathing_records'] as const;

  const exportData: Record<string, unknown> = {
    meta: {
      username,
      exportedAt: new Date().toISOString(),
      version: 4,
      app: 'qingxin-shudong',
    },
  };

  // 用户信息
  const user = await db.get('users', username);
  if (user) {
    exportData.user = { ...user, passwordHash: '***' } as User; // 脱敏
  }

  // 各 store 数据（按 username 过滤）
  for (const storeName of indexedStores) {
    try {
      const all = await db.getAllFromIndex(storeName, 'by-username', username);
      exportData[storeName] = all;
    } catch {
      exportData[storeName] = [];
    }
  }

  // messages store 没有 by-username 索引，通过 conversations 关联查询
  try {
    const conversations = await getConversationsByUsername(username);
    const allMessages: unknown[] = [];
    for (const conv of conversations) {
      if (conv.id !== undefined) {
        const msgs = await getMessagesByConversation(conv.id);
        allMessages.push(...msgs);
      }
    }
    exportData.messages = allMessages;
  } catch {
    exportData.messages = [];
  }

  // 下载 JSON
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `青心树洞-数据备份-${username}-${formatDateForFile(new Date())}.json`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatDateForFile(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}
