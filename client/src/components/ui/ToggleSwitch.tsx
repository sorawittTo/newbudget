import React from 'react';
import './ToggleSwitch.css';

interface ToggleSwitchProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  isActive,
  onToggle,
  label = 'แก้ไข',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'toggle-switch-sm',
    md: 'toggle-switch-md',
    lg: 'toggle-switch-lg'
  };

  const toggleId = `toggle-switch-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`toggle-switch-wrapper ${className}`}>
      {label && (
        <span className="toggle-switch-label">{label}</span>
      )}
      <div className={`toggle-container ${sizeClasses[size]}`}>
        <input
          className="toggle-input"
          id={toggleId}
          name={toggleId}
          type="checkbox"
          checked={isActive}
          onChange={(e) => onToggle(e.target.checked)}
          aria-label={label}
          title={label}
        />
        <div className="toggle-handle-wrapper">
          <div className="toggle-handle">
            <div className="toggle-handle-knob"></div>
            <div className="toggle-handle-bar-wrapper">
              <div className="toggle-handle-bar"></div>
            </div>
          </div>
        </div>
        <div className="toggle-base">
          <div className="toggle-base-inside"></div>
        </div>
      </div>
    </div>
  );
};