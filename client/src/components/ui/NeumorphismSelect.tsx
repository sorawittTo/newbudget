import React from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

interface NeumorphismSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export const NeumorphismSelect: React.FC<NeumorphismSelectProps> = ({
  label,
  error,
  className,
  children,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={clsx(
            'w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl transition-all duration-300 focus:outline-none text-gray-900 appearance-none cursor-pointer',
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
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};