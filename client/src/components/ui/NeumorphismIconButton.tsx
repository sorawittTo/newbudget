import React from 'react';
import { LucideIcon } from 'lucide-react';
import './NeumorphismIconButton.css';

interface NeumorphismIconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const NeumorphismIconButton: React.FC<NeumorphismIconButtonProps> = ({
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
    sm: 'neumorphism-icon-btn-sm',
    md: 'neumorphism-icon-btn-md',
    lg: 'neumorphism-icon-btn-lg'
  };

  const variantClasses = {
    primary: 'neumorphism-icon-btn-primary',
    secondary: 'neumorphism-icon-btn-secondary',
    success: 'neumorphism-icon-btn-success',
    danger: 'neumorphism-icon-btn-danger',
    warning: 'neumorphism-icon-btn-warning'
  };

  return (
    <button
      className={`neumorphism-icon-btn ${sizeClasses[size]} ${variantClasses[variant]} ${
        disabled ? 'disabled' : ''
      } ${loading ? 'loading' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      title={label}
    >
      <div className="neumorphism-icon-btn-outer">
        <div className="neumorphism-icon-btn-inner">
          {loading ? (
            <div className="neumorphism-icon-btn-loader">
              <div className="neumorphism-icon-btn-circle"></div>
            </div>
          ) : (
            <Icon className="neumorphism-icon-btn-icon" />
          )}
        </div>
      </div>
    </button>
  );
};