import { Modal } from './Modal';
import { useSettingsStore } from '@/stores/settingsStore';

interface AccessibilityPanelProps {
  open: boolean;
  onClose: () => void;
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 pr-4">
        <p className="font-medium" style={{ color: 'var(--color-text)' }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus-visible:outline-none min-w-[44px] min-h-[44px] md:min-h-[28px] md:min-w-[48px]"
        style={{
          backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-border)',
        }}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export function AccessibilityPanel({ open, onClose }: AccessibilityPanelProps) {
  const { highContrast, largeFont, reducedMotion, toggleContrast, toggleLargeFont, toggleReducedMotion } =
    useSettingsStore();

  return (
    <Modal open={open} onClose={onClose} title="无障碍设置" size="sm">
      <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
        <ToggleRow
          label="高对比度"
          description="提升文字与背景对比度，便于视弱用户阅读"
          checked={highContrast}
          onChange={toggleContrast}
        />
        <ToggleRow
          label="大字号"
          description="将界面文字放大 1.25 倍，提升可读性"
          checked={largeFont}
          onChange={toggleLargeFont}
        />
        <ToggleRow
          label="减少动效"
          description="禁用动画与过渡效果，适合前庭功能敏感用户"
          checked={reducedMotion}
          onChange={toggleReducedMotion}
        />
      </div>

      <div className="mt-6 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          💡 设置会自动保存到本地，下次访问时保持生效。
        </p>
      </div>
    </Modal>
  );
}
