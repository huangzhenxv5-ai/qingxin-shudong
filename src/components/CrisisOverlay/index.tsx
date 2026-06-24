import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CRISIS_MESSAGES, CRISIS_HOTLINES } from '@/constants/crisisKeywords';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface CrisisOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function CrisisOverlay({ open, onClose }: CrisisOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // 焦点陷阱 + Escape 关闭（统一使用 useFocusTrap）
  useFocusTrap({
    enabled: open,
    containerRef: overlayRef,
    onEscape: onClose,
  });

  // 锁定背景滚动
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-title"
    >
      {/* 温暖渐变背景 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, #FFF5E6 0%, #FFE4E1 50%, #E6F3FF 100%)',
        }}
        aria-hidden="true"
      />

      <div
        ref={overlayRef}
        className="relative w-full max-w-lg rounded-3xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* 温暖图标 */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{
              background: 'linear-gradient(135deg, #FFD9C0 0%, #FFB6A3 100%)',
              fontSize: '2.5rem',
            }}
            aria-hidden="true"
          >
            💛
          </div>
          <h2
            id="crisis-title"
            className="text-2xl font-bold mb-3"
            style={{ color: '#2C3E50' }}
          >
            {CRISIS_MESSAGES.title}
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: '#5D6D7E' }}
          >
            {CRISIS_MESSAGES.main}
          </p>
          <p
            className="text-xs leading-relaxed mt-3"
            style={{ color: '#85929E' }}
          >
            {CRISIS_MESSAGES.sub}
          </p>
        </div>

        {/* 热线列表 */}
        <div className="space-y-2 mb-6">
          <h3
            className="text-sm font-bold mb-2 text-center"
            style={{ color: '#2C3E50' }}
          >
            📞 24 小时心理援助热线
          </h3>
          {CRISIS_HOTLINES.map((hotline) => (
            <a
              key={hotline.number}
              href={`tel:${hotline.number.replace(/-/g, '')}`}
              className="flex items-center justify-between p-3.5 rounded-2xl transition-all hover:scale-[1.02] min-h-[44px]"
              style={{
                backgroundColor: '#F8F9FA',
                border: '1px solid #E8E8E8',
              }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: '#2C3E50' }}>
                  {hotline.name}
                </p>
                <p className="text-xs" style={{ color: '#85929E' }}>
                  {hotline.hours}
                </p>
              </div>
              <span
                className="text-base font-bold"
                style={{ color: '#E74C3C' }}
              >
                {hotline.number}
              </span>
            </a>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="space-y-2">
          <a
            href={`tel:${CRISIS_HOTLINES[0].number.replace(/-/g, '')}`}
            className="block w-full py-3.5 rounded-2xl text-center font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #FF8C7A 0%, #E74C3C 100%)',
              boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)',
            }}
          >
            {CRISIS_MESSAGES.cta}
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl text-sm font-medium transition-all hover:bg-gray-100"
            style={{ color: '#85929E' }}
          >
            {CRISIS_MESSAGES.dismiss}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
