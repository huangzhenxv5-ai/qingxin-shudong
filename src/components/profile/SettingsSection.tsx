import { type ReactNode } from 'react';

interface SettingsSectionProps {
  title: string;
  icon?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({ title, icon, children, className = '' }: SettingsSectionProps) {
  return (
    <section className={`mb-4 ${className}`} aria-label={title}>
      <h2
        className="text-base font-bold mb-3 flex items-center gap-2"
        style={{ color: 'var(--color-text)' }}
      >
        {icon && <span aria-hidden="true">{icon}</span>}
        {title}
      </h2>
      <div className="card">{children}</div>
    </section>
  );
}
