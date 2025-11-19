import React from 'react';
import { Avatar } from '../Avatar';
import './InfoCard.css';

export interface InfoCardProps {
  icon?: React.ReactNode;
  avatar?: {
    src?: string;
    alt?: string;
  };
  title: string;
  subtitle?: string;
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  avatar,
  title,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`shared-info-card ${className}`}>
      {avatar ? (
        <Avatar src={avatar.src} alt={avatar.alt} size="small" />
      ) : icon ? (
        <div className="shared-info-card-icon">{icon}</div>
      ) : null}
      <div className="shared-info-card-content">
        <div className="shared-info-card-title">{title}</div>
        {subtitle && <div className="shared-info-card-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
};

