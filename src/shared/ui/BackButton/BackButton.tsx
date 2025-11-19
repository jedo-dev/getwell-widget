import React from 'react';
import { LeftOutlined } from '@ant-design/icons';
import './BackButton.css';

export interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, className = '' }) => {
  return (
    <LeftOutlined
      className={`shared-back-button ${className}`}
      onClick={onClick}
    />
  );
};

