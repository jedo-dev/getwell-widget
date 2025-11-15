import React from 'react';
import { openGetWellWidget } from '../lib/widget-manager';
import './StickyButton.css';

export interface StickyButtonProps {
  enabled?: boolean;
}

const StickyButton: React.FC<StickyButtonProps> = ({ enabled = false }) => {
  const handleClick = () => {
    if (enabled) {
      openGetWellWidget();
    }
  };

  if (!enabled) {
    return null;
  }

  return (
    <div className='sticky-button-container'>
      {/* Пульсирующие круги (капли) - эффект ripple */}
      {[0, 1, 2].map((index) => (
        <div key={index} className={`sticky-button-pulse sticky-button-pulse-${index}`} />
      ))}

      {/* Основная кнопка */}
      <button className='sticky-button' onClick={handleClick} aria-label='Открыть онлайн запись'>
        <div className='sticky-button-content'>
          <span className='sticky-button-text-line1'>Онлайн</span>
          <span className='sticky-button-text-line2'>запись</span>
        </div>
      </button>
    </div>
  );
};

export default StickyButton;
