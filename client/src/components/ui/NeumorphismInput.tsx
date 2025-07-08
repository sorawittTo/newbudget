import React from 'react';
import { clsx } from 'clsx';

interface NeumorphismInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const NeumorphismInput: React.FC<NeumorphismInputProps> = ({
  label,
  error,
  className,
  type,
  ...props
}) => {
  // Force all numeric inputs to be text type to prevent arrow controls
  const inputType = type === 'number' ? 'text' : type;
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={inputType}
        className={clsx(
          'w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl transition-all duration-300 focus:outline-none text-gray-900 placeholder-gray-500',
          error ? 'text-red-600' : 'focus:text-blue-600',
          className
        )}
        style={{
          boxShadow: 'inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff'
        }}
        onFocus={(e) => {
          e.target.style.boxShadow = 'inset 6px 6px 12px #d1d5db, inset -6px -6px 12px #ffffff';
        }}
        onBlur={(e) => {
          e.target.style.boxShadow = 'inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff';
        }}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};