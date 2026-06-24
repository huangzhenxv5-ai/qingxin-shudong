import { create } from 'zustand';
import type { Session } from '@/types';

const SESSION_KEY = 'qingxin_session';
const REMEMBER_KEY = 'qingxin_remember';

interface AuthStore {
  username: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // 初始化：从 storage 恢复会话
  initAuth: () => void;
  // 设置登录状态
  login: (username: string, rememberMe: boolean) => void;
  // 退出登录
  logout: () => void;
  // 清除错误
  clearError: () => void;
}

// 读取会话
function readSession(): Session | null {
  // 先尝试 sessionStorage
  const sessionData = sessionStorage.getItem(SESSION_KEY);
  if (sessionData) {
    try {
      return JSON.parse(sessionData) as Session;
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }
  // 再尝试 localStorage（记住我）
  const rememberData = localStorage.getItem(REMEMBER_KEY);
  if (rememberData) {
    try {
      const session = JSON.parse(rememberData) as Session;
      // 检查是否过期
      if (session.expiresAt && session.expiresAt < Date.now()) {
        localStorage.removeItem(REMEMBER_KEY);
        return null;
      }
      return session;
    } catch {
      localStorage.removeItem(REMEMBER_KEY);
    }
  }
  return null;
}

// 写入会话
function writeSession(session: Session): void {
  const data = JSON.stringify(session);
  if (session.rememberMe) {
    localStorage.setItem(REMEMBER_KEY, data);
    sessionStorage.setItem(SESSION_KEY, data);
  } else {
    sessionStorage.setItem(SESSION_KEY, data);
    localStorage.removeItem(REMEMBER_KEY);
  }
}

// 清除会话
function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(REMEMBER_KEY);
}

export const useAuthStore = create<AuthStore>((set) => ({
  username: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  initAuth: () => {
    const session = readSession();
    if (session) {
      set({
        username: session.username,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } else {
      set({ username: null, isAuthenticated: false, loading: false, error: null });
    }
  },

  login: (username: string, rememberMe: boolean) => {
    const session: Session = {
      username,
      loginAt: Date.now(),
      rememberMe,
      expiresAt: rememberMe ? Date.now() + 7 * 24 * 60 * 60 * 1000 : undefined,
    };
    writeSession(session);
    set({ username, isAuthenticated: true, loading: false, error: null });
  },

  logout: () => {
    clearSession();
    set({ username: null, isAuthenticated: false, loading: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
