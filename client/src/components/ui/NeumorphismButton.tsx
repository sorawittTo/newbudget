import React from 'react';
import { LucideIcon } from 'lucide-react';
import './NeumorphismButton.css';

interface NeumorphismButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const NeumorphismButton: React.FC<NeumorphismButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'neumorphism-btn-sm',
    md: 'neumorphism-btn-md',
    lg: 'neumorphism-btn-lg'
  };

  const variantClasses = {
    primary: 'neumorphism-btn-primary',
    secondary: 'neumorphism-btn-secondary',
    success: 'neumorphism-btn-success',
    danger: 'neumorphism-btn-danger',
    warning: 'neumorphism-btn-warning'
  };

  return (
    <button
      className={`neumorphism-btn ${sizeClasses[size]} ${variantClasses[variant]} ${
        disabled ? 'disabled' : ''
      } ${loading ? 'loading' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      title={label}
    >
      <div className="neumorphism-btn-content">
        {loading ? (
          <div className="neumorphism-btn-loader">
            <div className="neumorphism-btn-circle"></div>
          </div>
        ) : (
          <>
            <Icon className="neumorphism-btn-icon" />
            <span className="neumorphism-btn-label">{label}</span>
          </>
        )}
      </div>
    </button>
  );
};