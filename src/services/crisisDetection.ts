import { CRISIS_KEYWORDS } from '@/constants/crisisKeywords';

// 检测文本是否包含危机关键词
export function detectCrisis(text: string): boolean {
  if (!text) return false;
  return CRISIS_KEYWORDS.some((kw) => text.includes(kw));
}

// 返回命中的危机关键词
export function getMatchedCrisisKeywords(text: string): string[] {
  if (!text) return [];
  return CRISIS_KEYWORDS.filter((kw) => text.includes(kw));
}
