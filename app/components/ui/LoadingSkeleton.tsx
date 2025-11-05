import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string;
  height?: string;
}

export function LoadingSkeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height 
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-slate-700 rounded';
  
  const variants = {
    text: 'h-4',
    rectangular: 'h-24',
    circular: 'rounded-full aspect-square',
  };
  
  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;
  
  return (
    <div 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={style}
    />
  );
}

// Compound component for common skeleton patterns
export function CardSkeleton() {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-800 p-6">
      <LoadingSkeleton variant="text" width="60%" className="mb-4" />
      <LoadingSkeleton variant="text" width="100%" className="mb-2" />
      <LoadingSkeleton variant="text" width="80%" className="mb-4" />
      <LoadingSkeleton variant="rectangular" height="100px" className="mb-4" />
      <div className="flex gap-2">
        <LoadingSkeleton variant="rectangular" width="60px" height="24px" className="rounded-full" />
        <LoadingSkeleton variant="rectangular" width="60px" height="24px" className="rounded-full" />
      </div>
    </div>
  );
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton 
          key={i} 
          variant="text" 
          width={i === lines - 1 ? '60%' : '100%'} 
        />
      ))}
    </div>
  );
}

