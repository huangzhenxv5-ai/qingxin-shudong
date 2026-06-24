import { Button } from '@/components/ui/Button';

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: number;
  messageCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete?: (id: string) => void;
}

function formatRelativeTime(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;

  const date = new Date(ts);
  const month = date.getMonth() + 1;
  const dayOfMonth = date.getDate();
  return `${month}月${dayOfMonth}日`;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: ConversationListProps) {
  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: 'var(--color-card)' }}
    >
      {/* 顶部新建对话按钮 */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <Button onClick={onNew} aria-label="新建对话">
          <span aria-hidden="true">✏️</span>
          新建对话
        </Button>
      </div>

      {/* 对话列表 */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar"
        role="listbox"
        aria-label="历史对话列表"
      >
        {conversations.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 px-4 text-center"
            style={{ color: 'var(--color-text-hint)' }}
          >
            <div className="text-4xl mb-3" aria-hidden="true">🌱</div>
            <p className="text-sm">还没有对话记录</p>
            <p className="text-xs mt-1">点击上方按钮开始第一次倾诉</p>
          </div>
        ) : (
          <ul className="py-2">
            {conversations.map((conv) => {
              const isActive = conv.id === activeId;
              return (
                <li key={conv.id}>
                  <div
                    role="option"
                    aria-selected={isActive}
                    tabIndex={0}
                    onClick={() => onSelect(conv.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelect(conv.id);
                      }
                    }}
                    className="relative mx-2 my-1 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 focus-visible:outline-none"
                    style={{
                      backgroundColor: isActive
                        ? 'var(--color-primary-light)'
                        : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-sm font-semibold truncate"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {conv.title}
                        </h3>
                        <p
                          className="text-xs mt-1 truncate"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {conv.lastMessage}
                        </p>
                        <div
                          className="flex items-center gap-2 mt-1.5 text-xs"
                          style={{ color: 'var(--color-text-hint)' }}
                        >
                          <span>{formatRelativeTime(conv.updatedAt)}</span>
                          <span aria-hidden="true">·</span>
                          <span>{conv.messageCount} 条消息</span>
                        </div>
                      </div>

                      {onDelete && (
                        <button
                          type="button"
                          aria-label={`删除对话 ${conv.title}`}
                          className="btn-icon flex-shrink-0 transition-colors opacity-60 hover:opacity-100"
                          style={{ color: 'var(--color-text-hint)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(conv.id);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--color-danger)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--color-text-hint)';
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
