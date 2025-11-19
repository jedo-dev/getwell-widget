import React from 'react';
import './InfoListItem.css';

export interface InfoListItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string | null;
  action?: {
    text: string;
    onClick: () => void;
  } | null;
  className?: string;
}

export const InfoListItem: React.FC<InfoListItemProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`shared-info-list-item ${className}`}>
      <div className="shared-info-list-item-left">
        <div className="shared-info-list-item-icon-wrapper">{icon}</div>
        <div className="shared-info-list-item-text">
          <div className="shared-info-list-item-title">{title}</div>
          {description && (
            <div className="shared-info-list-item-description">{description}</div>
          )}
        </div>
      </div>
      {action && (
        <button
          className="shared-info-list-item-action"
          onClick={action.onClick}
          type="button">
          {action.text}
        </button>
      )}
    </div>
  );
};

