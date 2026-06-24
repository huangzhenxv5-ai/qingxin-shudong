import { type ReactNode } from 'react';

type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
  interactive?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}

const variantClass: Record<CardVariant, string> = {
  default: 'card',
  elevated: 'card-elevated',
  outlined: 'card-outlined',
};

export function Card({
  children,
  className = '',
  variant = 'default',
  interactive = false,
  onClick,
  ariaLabel,
}: CardProps) {
  const classes = [
    variantClass[variant],
    interactive
      ? 'cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none'
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (onClick) {
    return (
      <div
        className={classes}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {children}
      </div>
    );
  }

  return <div className={classes}>{children}</div>;
}
