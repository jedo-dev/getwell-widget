import React from 'react';
import { Empty } from 'antd';
import './EmptyState.css';

export interface EmptyStateProps {
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  description,
  icon,
  className = '',
}) => {
  return (
    <div className={`shared-empty-state ${className}`}>
      <Empty description={description} image={icon} />
    </div>
  );
};

