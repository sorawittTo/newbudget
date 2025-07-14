import React from 'react';
import { Save } from 'lucide-react';
import './SaveButton.css';

interface SaveButtonProps {
  onClick: () => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  onClick,
  label = 'บันทึก',
  size = 'md',
  disabled = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'save-button-sm',
    md: 'save-button-md',
    lg: 'save-button-lg'
  };

  return (
    <button
      className={`save-button ${sizeClasses[size]} ${disabled ? 'disabled' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="save-button-content">
        <Save className="save-button-icon" />
        <span className="save-button-text">{label}</span>
      </div>
    </button>
  );
};