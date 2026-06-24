import { getDB } from './database';
import type { User } from '@/types';

// 创建用户
export async function createUser(user: User): Promise<void> {
  const db = await getDB();
  await db.add('users', user);
}

// 根据 username 查询用户
export async function getUserByUsername(username: string): Promise<User | undefined> {
  const db = await getDB();
  return db.get('users', username);
}

// 更新用户
export async function updateUser(user: User): Promise<void> {
  const db = await getDB();
  await db.put('users', user);
}

// 删除用户
export async function deleteUser(username: string): Promise<void> {
  const db = await getDB();
  await db.delete('users', username);
}

// 检查用户名是否存在
export async function isUsernameExists(username: string): Promise<boolean> {
  const user = await getUserByUsername(username);
  return !!user;
}
