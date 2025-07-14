import React from 'react';
import { Check } from 'lucide-react';
import { NeumorphismIconButton } from './NeumorphismIconButton';

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
  return (
    <NeumorphismIconButton
      icon={Check}
      label="บันทึก"
      onClick={onClick}
      variant="success"
      size={size}
      disabled={disabled}
      className={className}
    />
  );
};