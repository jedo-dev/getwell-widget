import { Button } from 'antd';
import React from 'react';

export interface StepFooterAction {
  label: string;
  onClick: () => void;
  type?: 'primary' | 'default';
  variant?: 'primary' | 'secondary';
}

export interface StepFooterProps {
  className?: string;
  secondary?: StepFooterAction | null;
  primary: StepFooterAction;
}

/**
 * Shared footer used in step screens.
 * Keeps existing CSS classnames via props.
 */
export const StepFooter: React.FC<StepFooterProps> = ({
  className = 'specialist-selection-footer',
  secondary,
  primary,
}) => {
  return (
    <div className={className}>
      {secondary && (
        <Button
          className='specialist-selection-footer-btn secondary'
          onClick={secondary.onClick}
        >
          {secondary.label}
        </Button>
      )}
      <Button
        type='primary'
        className='specialist-selection-footer-btn primary'
        onClick={primary.onClick}
      >
        {primary.label}
      </Button>
    </div>
  );
};
