interface StatsCardProps {
  icon: string;
  value: number | string;
  label: string;
  color?: string;
}

export function StatsCard({ icon, value, label, color = 'var(--color-primary)' }: StatsCardProps) {
  return (
    <div
      className="card flex flex-col items-center text-center"
      role="group"
      aria-label={`${label}：${value}`}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2"
        style={{ backgroundColor: color, opacity: 0.15 }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div
        className="text-2xl font-bold"
        style={{ color: 'var(--color-text)' }}
        aria-label={`数值 ${value}`}
      >
        {value}
      </div>
      <div
        className="text-xs mt-0.5"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </div>
    </div>
  );
}
