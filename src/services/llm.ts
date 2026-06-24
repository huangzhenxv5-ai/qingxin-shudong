import { SYSTEM_PROMPTS, SAFETY_PROMPT, type EmotionStrategy } from '@/constants/prompts';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Agnes AI（OpenAI 兼容接口）默认配置
const API_BASE = import.meta.env.VITE_LLM_API_BASE || '/llm-api';
const API_KEY = import.meta.env.VITE_LLM_API_KEY || '';
const MODEL = import.meta.env.VITE_LLM_MODEL || 'agnes-2.0-flash';

// 是否配置了 LLM API
export function isLLMConfigured(): boolean {
  return !!API_KEY;
}

// 获取系统提示词
export function getSystemPrompt(strategy: EmotionStrategy): string {
  return SYSTEM_PROMPTS[strategy] + SAFETY_PROMPT;
}

// 流式聊天：逐字 yield 内容
export async function* streamChat(
  messages: ChatMessage[],
  systemPrompt: string,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  if (!API_KEY) {
    // 未配置 API Key 时使用降级回复
    yield* fallbackReply(messages);
    return;
  }

  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
      temperature: 0.7,
      max_tokens: 500,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`LLM API 请求失败：${response.status}`);
  }

  if (!response.body) {
    throw new Error('LLM API 未返回响应体');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    // 保留最后不完整的行
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // 忽略解析错误的行
      }
    }
  }
}

// 降级回复：未配置 API Key 时使用预设回复
async function* fallbackReply(messages: ChatMessage[]): AsyncGenerator<string> {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
  const text = lastUserMsg?.content || '';

  let reply = '我在这里听你说，你的感受是真实的，允许自己去感受它。能多告诉我一些吗？';

  if (/难过|伤心|哭|不开心/.test(text)) {
    reply = '我能感受到你现在很难过。难过的时候，允许自己哭出来也是好的。你愿意和我说说发生了什么吗？我会一直在这里陪着你。';
  } else if (/紧张|害怕|担心|焦虑|压力/.test(text)) {
    reply = '感到紧张是很正常的。试试深呼吸，吸气 4 秒，呼气 6 秒。你愿意和我说说是什么让你感到焦虑吗？我们一起想办法。';
  } else if (/开心|高兴|太好了|成功/.test(text)) {
    reply = '听到你这么开心，我也为你高兴！你能做到真的很棒。记得把这个开心的时刻记下来，以后难过的时候可以拿出来看看。';
  } else if (/累|烦|无聊/.test(text)) {
    reply = '听起来你今天过得不太轻松。累了就休息一下，不用对自己太严格。想和我说说今天发生了什么吗？';
  }

  // 模拟流式输出
  for (const char of reply) {
    await new Promise((r) => setTimeout(r, 30));
    yield char;
  }
}

// 非流式聊天：一次性返回完整内容（用于日签文案、月度小结等场景）
export async function chat(
  messages: ChatMessage[],
  systemPrompt: string,
  options?: { temperature?: number; maxTokens?: number; signal?: AbortSignal },
): Promise<string> {
  const { temperature = 0.8, maxTokens = 300, signal } = options || {};

  if (!API_KEY) {
    // 未配置 API Key 时收集降级回复
    let result = '';
    for await (const chunk of fallbackReply(messages)) {
      result += chunk;
    }
    return result;
  }

  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: false,
      temperature,
      max_tokens: maxTokens,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`LLM API 请求失败：${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}
