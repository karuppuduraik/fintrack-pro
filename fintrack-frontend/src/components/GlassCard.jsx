import React from 'react';

const GlassCard = ({ children, className = '', hoverable = false, ...props }) => {
  return (
    <div
      className={`glass-card rounded-2xl p-6 transition-all duration-300 ${
        hoverable ? 'hover:scale-[1.01] hover:shadow-glass-light dark:hover:shadow-glass-dark hover:border-brand-500/20' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
