import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  title?: string;
  subtitle?: string;
}

export function Section({ 
  children, 
  className = '', 
  id,
  title,
  subtitle 
}: SectionProps) {
  return (
    <section id={id} className={`py-12 md:py-16 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-8 text-center">
          {title && (
            <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

