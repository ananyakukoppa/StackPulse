import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'teal' | 'slate' | 'blue' | 'purple' | 'amber' | 'rose' | 'emerald';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  className = '',
  icon,
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const variantStyles = {
    teal: 'bg-teal-500/10 text-teal-400 border border-teal-500/30',
    slate: 'bg-slate-800 text-slate-300 border border-slate-700',
    blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
