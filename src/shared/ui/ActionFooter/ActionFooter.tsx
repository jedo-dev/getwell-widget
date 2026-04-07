import { Button } from 'antd';
import React from 'react';

interface ActionFooterProps {
  primaryLabel: string;
  onPrimaryClick: () => void;
  showSecondary?: boolean;
  secondaryLabel?: string;
  onSecondaryClick?: () => void;
  className?: string;
}

export const ActionFooter: React.FC<ActionFooterProps> = ({
  primaryLabel,
  onPrimaryClick,
  showSecondary = false,
  secondaryLabel = '',
  onSecondaryClick,
  className,
}) => {
  return (
    <div className={`gw-action-footer ${className || ''}`.trim()}>
      {showSecondary && onSecondaryClick ? (
        <Button className='gw-action-footer-btn gw-action-footer-btn--secondary' onClick={onSecondaryClick}>
          {secondaryLabel}
        </Button>
      ) : null}
      <Button
        type='primary'
        className='gw-action-footer-btn gw-action-footer-btn--primary'
        onClick={onPrimaryClick}>
        {primaryLabel}
      </Button>
    </div>
  );
};
