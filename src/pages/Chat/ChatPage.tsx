import { useEffect, useRef, useState, useCallback, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { CrisisOverlay } from '@/components/CrisisOverlay';
import { ConversationList } from './ConversationList';
import { MessageBubble } from './MessageBubble';
import { EmptyState } from './EmptyState';
import { useChat } from '@/hooks/useChat';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { isLLMConfigured } from '@/services/llm';

export function ChatPage() {
  const {
    conversations,
    activeId,
    messages,
    isThinking,
    crisisTriggered,
    selectConversation,
    newConversation,
    removeConversation,
    sendMessage,
    dismissCrisis,
  } = useChat();
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeId);

  // 新消息时自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // 抽屉：Escape 关闭 + 焦点陷阱（统一使用 useFocusTrap）
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  useFocusTrap({
    enabled: drawerOpen,
    containerRef: drawerRef,
    onEscape: closeDrawer,
  });

  // textarea 自适应高度
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [input]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isThinking) return;
    setInput('');
    sendMessage(text);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelect = (id: string) => {
    selectConversation(id);
    setDrawerOpen(false);
  };

  const handleNew = async () => {
    await newConversation();
    setDrawerOpen(false);
  };

  const handleStart = async () => {
    await newConversation();
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const showEmpty = !activeId; // 无活跃对话时显示空状态，有活跃对话则显示输入区

  return (
    <MainLayout showTabBar={false}>
      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>

      {/* 页面级返回按钮 */}
      <div className="px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97] min-h-[44px] whitespace-nowrap"
          style={{
            color: 'var(--color-text-secondary)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
          aria-label="返回上一页"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回首页
        </button>
      </div>

      {/* LLM 未配置提示 */}
      {!isLLMConfigured() && (
        <div
          className="mb-2 px-4 py-2 rounded-xl text-xs text-center"
          style={{
            backgroundColor: 'var(--color-warning-light, #FFF3E0)',
            color: 'var(--color-warning, #E65100)',
          }}
          role="status"
        >
          ⚠️ 未配置 LLM API，当前使用预设回复。配置 .env 中的 VITE_LLM_API_KEY 可启用真实 AI 对话。
        </div>
      )}

      <div
        className="flex overflow-hidden rounded-2xl h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)]"
        style={{
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* 桌面端：左侧历史列表 */}
        <aside
          className="hidden lg:flex lg:w-80 lg:flex-shrink-0 flex-col"
          style={{ borderRight: '1px solid var(--color-border)' }}
        >
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelect}
            onNew={handleNew}
            onDelete={removeConversation}
          />
        </aside>

        {/* 右侧对话区 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 顶部标题栏 */}
          <header
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-card)',
            }}
          >
            {/* 移动端：历史列表按钮 */}
            <button
              type="button"
              className="btn-icon lg:hidden transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              onClick={() => setDrawerOpen(true)}
              aria-label="打开历史对话"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xl flex-shrink-0" aria-hidden="true">🌳</span>
              <div className="min-w-0">
                <h1 className="text-base font-bold truncate" style={{ color: 'var(--color-text)' }}>
                  {activeConversation?.title ?? 'AI 树洞'}
                </h1>
                <p className="text-xs" style={{ color: 'var(--color-text-hint)' }}>
                  温暖陪伴 · 安全倾诉
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn-icon hidden lg:flex transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              onClick={handleNew}
              aria-label="新建对话"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          </header>

          {/* 消息列表 / 空状态 */}
          {showEmpty ? (
            <div className="flex-1 overflow-y-auto">
              <EmptyState onStart={handleStart} />
            </div>
          ) : (
            <div
              className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4"
              role="log"
              aria-live="polite"
              aria-label="对话消息"
            >
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                  typing={msg.typing}
                />
              ))}
              {isThinking && <ThinkingBubble />}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* 底部输入区 */}
          {!showEmpty && (
            <div
              className="flex-shrink-0 px-3 py-3"
              style={{
                borderTop: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-card)',
              }}
            >
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  disabled
                  className="btn-icon flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  style={{
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                  }}
                  aria-label="语音输入（暂未开放）"
                  title="语音输入暂未开放"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </button>

                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="说说你的心事..."
                    aria-label="输入消息"
                    rows={1}
                    className="w-full px-4 py-2.5 rounded-2xl resize-none outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                      maxHeight: '120px',
                      minHeight: '44px',
                      lineHeight: '1.5',
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || isThinking}
                  className="btn-icon flex-shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                  }}
                  aria-label="发送"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 移动端：历史抽屉 */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[150] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm shadow-2xl flex flex-col"
            style={{
              backgroundColor: 'var(--color-card)',
              animation: 'drawerSlideIn 0.3s ease-out',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="历史对话"
          >
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <h2 className="text-base font-bold font-heading" style={{ color: 'var(--color-text)' }}>历史对话</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="btn-icon transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
                aria-label="关闭历史对话"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <ConversationList
                conversations={conversations}
                activeId={activeId}
                onSelect={handleSelect}
                onNew={handleNew}
                onDelete={removeConversation}
              />
            </div>
          </div>
        </div>
      )}

      {/* 危机干预弹窗 */}
      <CrisisOverlay open={crisisTriggered} onClose={dismissCrisis} />
    </MainLayout>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex justify-start mb-4 animate-fade-in">
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3 mt-1"
        style={{
          backgroundColor: 'var(--color-primary-light)',
          boxShadow: 'var(--shadow-card)',
        }}
        aria-hidden="true"
      >
        🌳
      </div>
      <div
        className="px-4 py-3 rounded-2xl"
        style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderTopLeftRadius: '6px',
          boxShadow: 'var(--shadow-card)',
        }}
        aria-label="AI 正在输入"
      >
        <div className="flex items-center gap-1.5">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: 'var(--color-text-hint)',
                animation: 'typingDot 1.2s ease-in-out infinite',
                animationDelay: `${delay}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
