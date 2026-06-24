import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AccessibilitySettings {
  highContrast: boolean;
  largeFont: boolean;
  reducedMotion: boolean;
}

interface SettingsStore extends AccessibilitySettings {
  theme: ThemeMode;
  systemTheme: 'light' | 'dark';
  sidebarCollapsed: boolean;

  setTheme: (theme: ThemeMode) => void;
  toggleContrast: () => void;
  toggleLargeFont: () => void;
  toggleReducedMotion: () => void;
  setSystemTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  initSettings: () => void;
}

const THEME_KEY = 'qxsd-theme';
const A11Y_KEY = 'qxsd-a11y';
const SIDEBAR_KEY = 'qxsd-sidebar-collapsed';

function readTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // ignore
  }
  return 'system';
}

function readA11y(): AccessibilitySettings {
  try {
    const stored = localStorage.getItem(A11Y_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AccessibilitySettings>;
      return {
        highContrast: parsed.highContrast ?? false,
        largeFont: parsed.largeFont ?? false,
        reducedMotion: parsed.reducedMotion ?? false,
      };
    }
  } catch {
    // ignore
  }
  // 默认尊重系统 prefers-reduced-motion
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {
    highContrast: false,
    largeFont: false,
    reducedMotion: prefersReduced,
  };
}

function readSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === 'true';
  } catch {
    return false;
  }
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeClass(theme: ThemeMode, systemTheme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const effective = theme === 'system' ? systemTheme : theme;
  if (effective === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  // 更新 theme-color meta
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', effective === 'dark' ? '#1A1B1E' : '#4CAF50');
  }
}

function applyA11yClasses(settings: AccessibilitySettings) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('contrast-high', settings.highContrast);
  root.classList.toggle('font-large', settings.largeFont);
  root.classList.toggle('motion-reduce', settings.reducedMotion);
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  theme: 'system',
  systemTheme: 'light',
  highContrast: false,
  largeFont: false,
  reducedMotion: false,
  sidebarCollapsed: false,

  setTheme: (theme) => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
    const { systemTheme } = get();
    applyThemeClass(theme, systemTheme);
    set({ theme });
  },

  toggleContrast: () => {
    const next = !get().highContrast;
    const settings = { ...get(), highContrast: next };
    try {
      localStorage.setItem(A11Y_KEY, JSON.stringify({
        highContrast: next,
        largeFont: get().largeFont,
        reducedMotion: get().reducedMotion,
      }));
    } catch {
      // ignore
    }
    applyA11yClasses(settings);
    set({ highContrast: next });
  },

  toggleLargeFont: () => {
    const next = !get().largeFont;
    const settings = { ...get(), largeFont: next };
    try {
      localStorage.setItem(A11Y_KEY, JSON.stringify({
        highContrast: get().highContrast,
        largeFont: next,
        reducedMotion: get().reducedMotion,
      }));
    } catch {
      // ignore
    }
    applyA11yClasses(settings);
    set({ largeFont: next });
  },

  toggleReducedMotion: () => {
    const next = !get().reducedMotion;
    const settings = { ...get(), reducedMotion: next };
    try {
      localStorage.setItem(A11Y_KEY, JSON.stringify({
        highContrast: get().highContrast,
        largeFont: get().largeFont,
        reducedMotion: next,
      }));
    } catch {
      // ignore
    }
    applyA11yClasses(settings);
    set({ reducedMotion: next });
  },

  setSystemTheme: (systemTheme) => {
    const { theme } = get();
    applyThemeClass(theme, systemTheme);
    set({ systemTheme });
  },

  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    try {
      localStorage.setItem(SIDEBAR_KEY, String(next));
    } catch {
      // ignore
    }
    set({ sidebarCollapsed: next });
  },

  initSettings: () => {
    const theme = readTheme();
    const systemTheme = getSystemTheme();
    const a11y = readA11y();
    const sidebarCollapsed = readSidebarCollapsed();

    applyThemeClass(theme, systemTheme);
    applyA11yClasses(a11y);

    set({
      theme,
      systemTheme,
      ...a11y,
      sidebarCollapsed,
    });

    // 监听系统主题变化
    if (typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        get().setSystemTheme(e.matches ? 'dark' : 'light');
      };
      if (media.addEventListener) {
        media.addEventListener('change', handler);
      } else if (media.addListener) {
        // Safari < 14
        media.addListener(handler);
      }
    }
  },
}));
