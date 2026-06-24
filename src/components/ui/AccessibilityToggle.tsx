interface AccessibilityToggleProps {
  onClick: () => void;
  className?: string;
}

export function AccessibilityToggle({ onClick, className = '' }: AccessibilityToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn-icon hover:bg-surface focus-visible:outline-none ${className}`}
      style={{ color: 'var(--color-text)' }}
      aria-label="无障碍设置"
      title="无障碍设置"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="4" r="2" />
        <path d="M19 13v-2c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v2" />
        <path d="M12 9v11" />
        <path d="M8 20l4-4 4 4" />
      </svg>
    </button>
  );
}
