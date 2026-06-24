import { useCallback, useState } from 'react';
import { detectCrisis } from '@/services/crisisDetection';

// 危机检测 Hook：用于日记等非聊天场景
export function useCrisis() {
  const [crisisTriggered, setCrisisTriggered] = useState(false);
  const [crisisSource, setCrisisSource] = useState<string>('');

  // 检测文本并触发干预
  const checkText = useCallback((text: string, source: string = 'diary'): boolean => {
    if (detectCrisis(text)) {
      setCrisisTriggered(true);
      setCrisisSource(source);
      return true;
    }
    return false;
  }, []);

  const dismiss = useCallback(() => {
    setCrisisTriggered(false);
    setCrisisSource('');
  }, []);

  return {
    crisisTriggered,
    crisisSource,
    checkText,
    dismiss,
  };
}
