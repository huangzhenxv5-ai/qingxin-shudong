import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  createConversation,
  getConversationsByUsername,
  getMessagesByConversation,
  addMessage,
  deleteConversation,
  updateConversation,
} from '@/db/conversationStore';
import { streamChat, getSystemPrompt, type ChatMessage as LLMMessage } from '@/services/llm';
import { detectEmotion } from '@/services/emotionAnalysis';
import { detectCrisis } from '@/services/crisisDetection';
import type { EmotionStrategy } from '@/constants/prompts';

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  typing?: boolean;
}

export interface ConversationItem {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: number;
  messageCount: number;
}

const CONTEXT_LIMIT = 5;

export function useChat() {
  const username = useAuthStore((s) => s.username);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [crisisTriggered, setCrisisTriggered] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // 加载对话列表
  const loadConversations = useCallback(async () => {
    if (!username) return;
    const convs = await getConversationsByUsername(username);
    const items: ConversationItem[] = convs.map((c) => ({
      id: String(c.id),
      title: c.title,
      lastMessage: '',
      updatedAt: c.updatedAt,
      messageCount: 0,
    }));
    // 填充最后消息和数量
    for (const item of items) {
      const msgs = await getMessagesByConversation(Number(item.id));
      if (msgs.length > 0) {
        item.lastMessage = msgs[msgs.length - 1].content;
        item.messageCount = msgs.length;
      }
    }
    setConversations(items);
  }, [username]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 选择对话
  const selectConversation = useCallback(async (id: string) => {
    setActiveId(id);
    const msgs = await getMessagesByConversation(Number(id));
    setMessages(
      msgs.map((m) => ({
        id: `msg-${m.id}`,
        role: m.role === 'user' ? 'user' : 'ai',
        content: m.content,
        timestamp: m.createdAt,
      })),
    );
  }, []);

  // 新建对话
  const newConversation = useCallback(async (): Promise<string | null> => {
    if (!username) return null;
    const id = await createConversation(username, '新的对话');
    await loadConversations();
    setActiveId(String(id));
    setMessages([]);
    return String(id);
  }, [username, loadConversations]);

  // 删除对话
  const removeConversation = useCallback(
    async (id: string) => {
      await deleteConversation(Number(id));
      if (activeId === id) {
        setActiveId(null);
        setMessages([]);
      }
      await loadConversations();
    },
    [activeId, loadConversations],
  );

  // 发送消息（核心：流式 AI 回复 + 危机检测）
  const sendMessage = useCallback(
    async (text: string) => {
      if (!username || !text.trim() || isThinking) return;

      // 危机检测
      if (detectCrisis(text)) {
        setCrisisTriggered(true);
      }

      // 确保有活跃对话
      let convId = activeId;
      if (!convId) {
        convId = await newConversation();
        if (!convId) return;
      }

      const numConvId = Number(convId);

      // 添加用户消息到 UI 和 DB
      const userMsg: ChatMessageItem = {
        id: `msg-local-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      await addMessage(numConvId, 'user', text);

      // 更新对话标题（首条消息时）
      if (messages.length === 0) {
        const title = text.slice(0, 20) + (text.length > 20 ? '...' : '');
        await updateConversation(numConvId, { title });
      }

      setIsThinking(true);

      // 情绪分析 + 策略选择
      const strategy: EmotionStrategy = detectEmotion(text);
      const systemPrompt = getSystemPrompt(strategy);

      // 构建上下文（最近 N 条）
      const recentMsgs = await getMessagesByConversation(numConvId);
      const contextMsgs: LLMMessage[] = recentMsgs
        .slice(-CONTEXT_LIMIT)
        .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));

      // 流式输出
      const aiMsgId = `msg-ai-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: aiMsgId, role: 'ai', content: '', timestamp: Date.now(), typing: true },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;

      let fullReply = '';
      try {
        for await (const chunk of streamChat(contextMsgs, systemPrompt, controller.signal)) {
          fullReply += chunk;
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsgId ? { ...m, content: fullReply } : m)),
          );
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        fullReply = '抱歉，我暂时无法回复。请稍后再试，我会一直在这里等你。';
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, content: fullReply } : m)),
        );
      } finally {
        // 标记完成
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, typing: false } : m)),
        );
        setIsThinking(false);
        abortRef.current = null;

        // 保存 AI 回复到 DB
        if (fullReply) {
          await addMessage(numConvId, 'assistant', fullReply);
        }
        await loadConversations();
      }
    },
    [username, activeId, isThinking, messages.length, newConversation, loadConversations],
  );

  // 停止生成
  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // 关闭危机弹窗
  const dismissCrisis = useCallback(() => {
    setCrisisTriggered(false);
  }, []);

  return {
    conversations,
    activeId,
    messages,
    isThinking,
    crisisTriggered,
    selectConversation,
    newConversation,
    removeConversation,
    sendMessage,
    stopGeneration,
    dismissCrisis,
    reload: loadConversations,
  };
}
