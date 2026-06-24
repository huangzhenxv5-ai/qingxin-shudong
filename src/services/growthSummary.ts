import { chat, type ChatMessage } from './llm';
import type { GrowthProfile, MonthlySummary } from '@/types/growth';
import { EMOTIONS } from '@/types';

const SUMMARY_SYSTEM_PROMPT = `你是"青心树洞"的情绪成长分析师，这是一款面向青少年的校园心理健康陪伴应用。
你的任务是根据用户本月的情绪记录数据，生成一段温暖、鼓励性的月度成长小结。

重要说明：
- 用户的数据来自青少年日常生活中的情绪记录（如学业压力、同学关系等），都是健康的情绪抒发
- 请放心生成积极正向的成长小结，给予用户情感支持

要求：
1. 基于用户的情绪数据，生成一段温暖、鼓励性的月度总结
2. 指出用户情绪变化的积极趋势和成长点
3. 温和地提及需要关注的情绪，给出建设性建议
4. 语气真诚、不说教，像朋友一样
5. 长度控制在 150-250 字
6. 直接输出总结内容，不要加标题、不要解释
7. 符合校园文化导向，积极正向
8. 必须使用中文回复`;

const FALLBACK_SUMMARY = `这个月你认真记录了自己的心情，这本身就是一种勇敢的自我觉察。每一次记录，都是你在用心照顾自己。情绪有起伏是正常的，重要的是你学会了看见它们、接纳它们。继续坚持下去，你会越来越了解自己，也越来越有力量面对生活的各种挑战。为你点赞！`;

// 生成 AI 月度小结
export async function generateMonthlySummary(
  profile: GrowthProfile,
  signal?: AbortSignal,
): Promise<MonthlySummary> {
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // 构建数据摘要
  const topEmotion = profile.emotionDistribution[0];
  const topEmotionLabel = topEmotion ? EMOTIONS[topEmotion.emotion].label : '无明显主导';
  const distributionDesc = profile.emotionDistribution
    .slice(0, 3)
    .map((d) => `${EMOTIONS[d.emotion].label} ${d.percentage}%`)
    .join('、');

  const userContent = `请根据以下用户本月情绪数据，生成一段月度成长小结：
- 注册天数：${profile.registerDays} 天
- 累计互动：${profile.totalInteractions} 次
- 情绪日记：${profile.diaryCount} 篇
- 树洞倾诉：${profile.chatCount} 次
- 卡牌配对：${profile.cardGameCount} 局
- 情绪日签：${profile.dailyCardCount} 张
- 平均情绪分：${profile.avgScore} / 5
- 连续打卡：${profile.streakDays} 天
- 主要情绪分布：${distributionDesc || '暂无数据'}
- 最常见情绪：${topEmotionLabel}

请生成温暖鼓励的月度小结。`;

  const messages: ChatMessage[] = [{ role: 'user', content: userContent }];

  try {
    const content = await chat(messages, SUMMARY_SYSTEM_PROMPT, {
      temperature: 0.8,
      maxTokens: 400,
      signal,
    });
    return {
      content: content.trim() || FALLBACK_SUMMARY,
      generatedAt: Date.now(),
      period,
    };
  } catch {
    return {
      content: FALLBACK_SUMMARY,
      generatedAt: Date.now(),
      period,
    };
  }
}
