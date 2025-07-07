import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
  success: 'bg-green-600 hover:bg-green-700 text-white border-green-600'
};

const sizeVariants = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg'
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const getNeumorphismStyle = () => {
    if (disabled || loading) {
      return {
        boxShadow: 'inset 3px 3px 6px #d1d5db, inset -3px -3px 6px #ffffff',
        backgroundColor: '#f3f4f6'
      };
    }
    
    switch (variant) {
      case 'primary':
        return {
          boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff',
          backgroundColor: '#3b82f6',
          color: '#ffffff'
        };
      case 'success':
        return {
          boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff',
          backgroundColor: '#10b981',
          color: '#ffffff'
        };
      case 'danger':
        return {
          boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff',
          backgroundColor: '#ef4444',
          color: '#ffffff'
        };
      default:
        return {
          boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff',
          backgroundColor: '#f9fafb',
          color: '#374151'
        };
    }
  };

  return (
    <motion.button
      whileHover={{ 
        scale: disabled || loading ? 1 : 1.02,
        boxShadow: disabled || loading ? 
          'inset 3px 3px 6px #d1d5db, inset -3px -3px 6px #ffffff' :
          '6px 6px 12px #d1d5db, -6px -6px 12px #ffffff'
      }}
      whileTap={{ 
        scale: disabled || loading ? 1 : 0.98,
        boxShadow: 'inset 6px 6px 12px #d1d5db, inset -6px -6px 12px #ffffff'
      }}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-2xl border-0 transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
        sizeVariants[size],
        className
      )}
      style={getNeumorphismStyle()}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
      )}
      {children}
    </motion.button>
  );
};