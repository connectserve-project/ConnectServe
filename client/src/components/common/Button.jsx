import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] select-none min-h-[42px] sm:min-h-[38px]';

  const variants = {
    primary: 'bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 hover:from-teal-500 hover:to-emerald-500 active:from-teal-700 active:to-emerald-700 text-white shadow-md shadow-teal-600/25 hover:shadow-lg hover:shadow-teal-500/35 focus:ring-teal-500',
    secondary: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 focus:ring-teal-500',
    gradient: 'bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/25 hover:shadow-lg hover:shadow-indigo-500/35 focus:ring-cyan-500',
    outline: 'border-2 border-teal-600/30 dark:border-teal-500/30 bg-transparent hover:bg-teal-50 dark:hover:bg-teal-950/40 text-teal-700 dark:text-teal-300 focus:ring-teal-500 font-semibold',
    danger: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:from-rose-700 active:to-pink-700 text-white shadow-md shadow-rose-600/25 focus:ring-rose-500',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 focus:ring-slate-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      ) : null}
      <span>{children}</span>
    </button>
  );
};
