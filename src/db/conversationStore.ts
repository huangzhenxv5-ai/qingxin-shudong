import { getDB, type Conversation, type Message } from './database';

// 创建新对话
export async function createConversation(username: string, title: string, emotion?: string): Promise<number> {
  const db = await getDB();
  const now = Date.now();
  const conv: Conversation = { username, title, emotion, createdAt: now, updatedAt: now };
  return (await db.add('conversations', conv)) as number;
}

// 获取用户所有对话（按更新时间倒序）
export async function getConversationsByUsername(username: string): Promise<Conversation[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('conversations', 'by-username', username);
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

// 更新对话
export async function updateConversation(id: number, patch: Partial<Conversation>): Promise<void> {
  const db = await getDB();
  const conv = await db.get('conversations', id);
  if (!conv) return;
  await db.put('conversations', { ...conv, ...patch, updatedAt: Date.now() });
}

// 删除对话（含消息）
export async function deleteConversation(id: number): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['conversations', 'messages'], 'readwrite');
  // 删除关联消息
  const msgIndex = tx.objectStore('messages').index('by-conversation');
  const keys = await msgIndex.getAllKeys(id);
  await Promise.all(keys.map((k) => tx.objectStore('messages').delete(k)));
  await tx.objectStore('conversations').delete(id);
  await tx.done;
}

// 添加消息
export async function addMessage(conversationId: number, role: 'user' | 'assistant', content: string): Promise<number> {
  const db = await getDB();
  const msg: Message = { conversationId, role, content, createdAt: Date.now() };
  const id = (await db.add('messages', msg)) as number;
  // 更新对话时间
  await updateConversation(conversationId, {});
  return id;
}

// 获取对话的所有消息（按时间正序）
export async function getMessagesByConversation(conversationId: number): Promise<Message[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('messages', 'by-conversation', conversationId);
  return all.sort((a, b) => a.createdAt - b.createdAt);
}

// 获取最近 N 条消息作为上下文
export async function getRecentMessages(conversationId: number, limit: number): Promise<Message[]> {
  const all = await getMessagesByConversation(conversationId);
  return all.slice(-limit);
}
