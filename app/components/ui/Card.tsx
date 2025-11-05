import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = true }: CardProps) {
  const hoverClasses = hover 
    ? 'hover:border-purple-700/60 hover:-translate-y-1 hover:shadow-lg transition-all duration-200'
    : '';
  
  return (
    <div className={`bg-slate-800 rounded-xl border border-slate-800 p-6 ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
}

