import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass';
  hoverable?: boolean;
}

export function Card({ variant = 'default', hoverable = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-outline-variant/30 shadow-sm transition-all duration-300 ${
        hoverable ? 'hover:-translate-y-1 hover:shadow-md cursor-pointer' : ''
      } ${
        variant === 'glass'
          ? 'glass-card'
          : 'bg-surface-container-lowest'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 border-b border-outline-variant/20 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
