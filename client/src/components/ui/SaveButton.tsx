import React from 'react';
import { Check } from 'lucide-react';
import './SaveButton.css';

interface SaveButtonProps {
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  onClick,
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
      title="บันทึก"
    >
      <div className="save-button-content">
        <Check className="save-button-icon" />
      </div>
    </button>
  );
};