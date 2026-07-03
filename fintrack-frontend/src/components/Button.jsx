import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  icon: Icon,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-lg',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg hover:shadow-brand-500/20 hover:from-brand-500 hover:to-indigo-500 focus:ring-brand-500',
    secondary: 'glass-input text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 focus:ring-slate-500 border border-slate-200 dark:border-slate-800',
    success: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 focus:ring-emerald-500',
    danger: 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg hover:shadow-rose-500/20 hover:from-rose-500 hover:to-red-500 focus:ring-rose-500',
    glass: 'bg-white/10 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 backdrop-blur-md border border-white/20 dark:border-slate-800/80 hover:bg-white/20 dark:hover:bg-slate-900/60 focus:ring-brand-500',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon className="-ml-1 mr-2 h-5 w-5" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
