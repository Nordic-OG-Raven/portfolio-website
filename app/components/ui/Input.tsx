import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ 
  label, 
  error, 
  helperText, 
  className = '', 
  ...props 
}: InputProps) {
  const inputClasses = `
    w-full px-4 py-2 rounded-lg border 
    ${error ? 'border-red-500' : 'border-slate-700'} 
    bg-slate-800 text-slate-100 
    focus:outline-none focus:ring-2 
    ${error ? 'focus:ring-red-500' : 'focus:ring-purple-700'} 
    focus:ring-offset-2 focus:ring-offset-slate-950
    placeholder:text-slate-500
    transition-colors
    ${className}
  `;
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <input className={inputClasses} {...props} />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-slate-400">{helperText}</p>
      )}
    </div>
  );
}

