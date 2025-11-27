import React from 'react';
import { openGetWellWidget } from '../../../lib/widget-manager';
import { WidgetState } from '../../../types';
import './StickyButton.css';

export interface StickyButtonProps {
  enabled?: boolean;
  widgetState?: WidgetState;
}

export const StickyButton: React.FC<StickyButtonProps> = ({ enabled = false, widgetState }) => {
  const handleClick = () => {
    if (widgetState?.config?.isNeedToBlankOpen) {
      window.open(widgetState?.config?.apiUrl, '_blank');
      return;
    }
    if (enabled) {
      openGetWellWidget();
    }
  };

  if (!enabled) {
    return null;
  }

  const pulseEnabled = widgetState?.config?.stickyButtonPulse ?? true;
  const position = widgetState?.config?.stickyButtonPosition ?? 'right';
  const buttonColor = widgetState?.config?.stickyButtonColor ?? '#5138EC';

  // Вычисляем цвет для hover эффекта (немного темнее основного)
  const getHoverColor = (color: string): string => {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      // Уменьшаем яркость на 15%
      const newR = Math.max(0, Math.floor(r * 0.85));
      const newG = Math.max(0, Math.floor(g * 0.85));
      const newB = Math.max(0, Math.floor(b * 0.85));
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    return '#3d2ac4'; // fallback
  };

  const hoverColor = getHoverColor(buttonColor);

  // Преобразуем hex в rgba для пульсации
  const hexToRgba = (hex: string, alpha: number): string => {
    if (hex.startsWith('#')) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `rgba(81, 56, 236, ${alpha})`; // fallback
  };

  const pulseColor = hexToRgba(buttonColor, 0.6);
  const pulseBorderColor = hexToRgba(buttonColor, 0.8);

  return (
    <div className={`sticky-button-container sticky-button-position-${position}`}>
      {/* Пульсирующие круги (капли) - эффект ripple */}
      {pulseEnabled &&
        [0, 1, 2].map((index) => (
          <div
            key={index}
            className={`sticky-button-pulse sticky-button-pulse-${index}`}
            style={{
              background: pulseColor,
              borderColor: pulseBorderColor,
            }}
          />
        ))}

      {/* Основная кнопка */}
      <button
        className='sticky-button'
        onClick={handleClick}
        aria-label='Открыть онлайн запись'
        style={{
          background: buttonColor,
          boxShadow: `0 4px 12px ${hexToRgba(buttonColor, 0.4)}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = hoverColor;
          e.currentTarget.style.boxShadow = `0 6px 16px ${hexToRgba(buttonColor, 0.5)}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = buttonColor;
          e.currentTarget.style.boxShadow = `0 4px 12px ${hexToRgba(buttonColor, 0.4)}`;
        }}>
        <div className='sticky-button-content'>
          <span className='sticky-button-text-line1'>Онлайн</span>
          <span className='sticky-button-text-line2'>запись</span>
        </div>
      </button>
    </div>
  );
};

