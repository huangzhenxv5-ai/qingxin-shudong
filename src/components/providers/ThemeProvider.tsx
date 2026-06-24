import { type ReactNode, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const initSettings = useSettingsStore((s) => s.initSettings);

  useEffect(() => {
    initSettings();
  }, [initSettings]);

  return <>{children}</>;
}
