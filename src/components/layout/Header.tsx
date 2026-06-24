interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header
      role="banner"
      className="glass flex items-center justify-between px-10 h-16 border-b"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <h1 className="text-xl font-heading font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>
        {title}
      </h1>
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
        style={{
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary-dark)',
        }}
      >
        <span className="block w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ backgroundColor: 'var(--color-primary)' }} aria-hidden="true" />
        <span>陪伴中</span>
      </div>
    </header>
  );
}
