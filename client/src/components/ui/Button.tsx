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
  const getAdvancedNeumorphismStyle = () => {
    if (disabled || loading) {
      return {
        background: '#e5e7eb',
        boxShadow: 'inset 8px 8px 16px rgba(0, 0, 0, 0.15), inset -8px -8px 16px rgba(255, 255, 255, 0.8)',
        color: '#9ca3af',
        cursor: 'not-allowed',
        filter: 'grayscale(0.5)'
      };
    }
    
    const baseStyle = {
      background: '#c9d5e0',
      borderRadius: '20px',
      border: 'none',
      position: 'relative',
      transformStyle: 'preserve-3d',
      transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: '500',
      boxShadow: '20px 20px 40px -5px rgba(0, 0, 0, 0.2), inset 15px 15px 20px rgba(255, 255, 255, 0.8), -15px -15px 30px rgba(255, 255, 255, 0.6), inset -3px -3px 15px rgba(0, 0, 0, 0.25)',
      filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1))'
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          color: '#1e40af'
        };
      case 'success':
        return {
          ...baseStyle,
          color: '#059669'
        };
      case 'danger':
        return {
          ...baseStyle,
          color: '#dc2626'
        };
      default:
        return {
          ...baseStyle,
          color: '#6b7280'
        };
    }
  };

  return (
    <motion.button
      whileHover={{ 
        scale: disabled || loading ? 1 : 1.05,
        boxShadow: disabled || loading ? 
          'inset 8px 8px 16px rgba(0, 0, 0, 0.15), inset -8px -8px 16px rgba(255, 255, 255, 0.8)' :
          '25px 25px 50px -5px rgba(0, 0, 0, 0.25), inset 20px 20px 25px rgba(255, 255, 255, 0.9), -20px -20px 40px rgba(255, 255, 255, 0.7), inset -5px -5px 20px rgba(0, 0, 0, 0.3)',
        filter: disabled || loading ? 'grayscale(0.5)' : 'drop-shadow(0 15px 30px rgba(0, 0, 0, 0.15))',
        y: disabled || loading ? 0 : -5
      }}
      whileTap={{ 
        scale: disabled || loading ? 1 : 0.98,
        boxShadow: 'inset 15px 15px 30px -5px rgba(0, 0, 0, 0.3), inset 10px 10px 15px rgba(255, 255, 255, 0.75), -10px -10px 20px rgba(255, 255, 255, 0.55), inset -2px -2px 10px rgba(0, 0, 0, 0.4)',
        filter: 'drop-shadow(0 5px 10px rgba(0, 0, 0, 0.2))',
        y: disabled || loading ? 0 : -2
      }}
      className={clsx(
        'inline-flex items-center justify-center font-medium border-0 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
        sizeVariants[size],
        className
      )}
      style={getAdvancedNeumorphismStyle()}
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