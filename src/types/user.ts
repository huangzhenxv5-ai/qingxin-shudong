// 用户类型
export interface User {
  username: string;
  passwordHash: string;
  nickname?: string;
  avatar?: string;
  ageGroup?: '12-14' | '15-16' | '17-18';
  createdAt: number;
  lastLoginAt?: number;
}

// 会话类型
export interface Session {
  username: string;
  loginAt: number;
  expiresAt?: number;
  rememberMe: boolean;
}

// 认证状态
export interface AuthState {
  isAuthenticated: boolean;
  currentUser: string | null;
  loading: boolean;
  error: string | null;
}
