import { TypewriterText } from '@/components/TypewriterText';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  typing?: boolean;
}

interface MessageBubbleProps {
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  typing?: boolean;
}

function formatTime(ts: number): string {
  const date = new Date(ts);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function MessageBubble({ role, content, timestamp, typing }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div
      className={`flex w-full mb-4 animate-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* AI 头像 */}
      {!isUser && (
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
      )}

      <div className={`flex flex-col max-w-[78%] sm:max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className="px-4 py-3 rounded-2xl break-words leading-relaxed text-[15px]"
          style={
            isUser
              ? {
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  borderTopRightRadius: '6px',
                  boxShadow: 'var(--shadow-card)',
                }
              : {
                  backgroundColor: 'var(--color-card)',
                  color: 'var(--color-text)',
                  borderTopLeftRadius: '6px',
                  boxShadow: 'var(--shadow-card)',
                  border: '1px solid var(--color-border)',
                }
          }
        >
          {typing && !isUser ? (
            <TypewriterText text={content} />
          ) : (
            <span style={{ whiteSpace: 'pre-wrap' }}>{content}</span>
          )}
        </div>

        <span
          className="mt-1 text-xs px-1"
          style={{ color: 'var(--color-text-hint)' }}
        >
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}
