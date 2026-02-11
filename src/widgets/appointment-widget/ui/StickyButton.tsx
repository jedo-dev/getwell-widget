import React from 'react';
import { openGetWellWidget } from '../../../lib/widget-manager';
import { WidgetState } from '../../../types';
import './StickyButton.css';

export interface StickyButtonProps {
  enabled?: boolean;
  widgetState?: WidgetState;
}

const HOVER_BY_PRIMARY: Record<string, string> = {
  '#344054': '#1D2939',
  '#0142FF': '#0037D6',
  '#C01048': '#A11043',
  '#039855': '#027A48',
  '#F79009': '#DC6803',
  '#752BDF': '#601DC0',
  '#50B7BF': '#119AA5',
};

const toHexRgb = (hex: string): { r: number; g: number; b: number } | null => {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return null;
  }

  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
};

const hexToRgba = (hex: string, alpha: number): string => {
  const rgb = toHexRgb(hex);
  if (!rgb) {
    return `rgba(81, 56, 236, ${alpha})`;
  }
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

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
  const buttonColor = (widgetState?.config?.stickyButtonColor ?? '#5138EC').toUpperCase();
  const hoverColor = HOVER_BY_PRIMARY[buttonColor] ?? buttonColor;
  const pulseColor = hexToRgba(buttonColor, 0.6);
  const pulseBorderColor = hexToRgba(buttonColor, 0.8);

  return (
    <div className={`sticky-button-container sticky-button-position-${position}`}>
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
