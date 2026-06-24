import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getUserByUsername, createUser, updateUser } from '@/db/userStore';
import { hashPassword, verifyPassword } from '@/utils/crypto';
import type { User } from '@/types';

// 用户名校验：3-16 字符，字母数字下划线
export function validateUsername(username: string): string | null {
  if (!username) return '请输入用户名';
  if (username.length < 3) return '用户名至少 3 个字符';
  if (username.length > 16) return '用户名最多 16 个字符';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return '用户名只能包含字母、数字和下划线';
  return null;
}

// 密码校验：6-20 字符，需包含字母和数字
export function validatePassword(password: string): string | null {
  if (!password) return '请输入密码';
  if (password.length < 6) return '密码至少 6 个字符';
  if (password.length > 20) return '密码最多 20 个字符';
  if (!/[a-zA-Z]/.test(password)) return '密码需包含字母';
  if (!/[0-9]/.test(password)) return '密码需包含数字';
  return null;
}

export function useAuth() {
  const { username, isAuthenticated, loading, error, initAuth, login, logout, clearError } =
    useAuthStore();

  // 注册
  const register = useCallback(
    async (usernameInput: string, password: string) => {
      const usernameError = validateUsername(usernameInput);
      if (usernameError) throw new Error(usernameError);

      const passwordError = validatePassword(password);
      if (passwordError) throw new Error(passwordError);

      // 检查用户名是否已存在
      const exists = await getUserByUsername(usernameInput);
      if (exists) throw new Error('用户名已存在');

      // 哈希密码并创建用户
      const passwordHash = await hashPassword(password);
      const now = Date.now();
      const user: User = {
        username: usernameInput,
        passwordHash,
        nickname: usernameInput,
        avatar: '🌱',
        createdAt: now,
        lastLoginAt: now,
      };
      await createUser(user);

      // 自动登录
      login(usernameInput, false);
    },
    [login],
  );

  // 登录
  const signIn = useCallback(
    async (usernameInput: string, password: string, rememberMe: boolean) => {
      const usernameError = validateUsername(usernameInput);
      if (usernameError) throw new Error(usernameError);

      if (!password) throw new Error('请输入密码');

      const user = await getUserByUsername(usernameInput);
      if (!user) throw new Error('用户名不存在');

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) throw new Error('密码错误');

      // 更新最后登录时间
      await updateUser({ ...user, lastLoginAt: Date.now() });

      login(usernameInput, rememberMe);
    },
    [login],
  );

  // 退出登录
  const signOut = useCallback(() => {
    logout();
  }, [logout]);

  return {
    username,
    isAuthenticated,
    loading,
    error,
    initAuth,
    register,
    signIn,
    signOut,
    clearError,
  };
}
