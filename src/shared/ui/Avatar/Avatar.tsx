import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import './Avatar.css';

export type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, number> = {
  small: 40,
  medium: 48,
  large: 56,
  xlarge: 120,
};

const iconSizeMap: Record<AvatarSize, number> = {
  small: 20,
  medium: 24,
  large: 24,
  xlarge: 60,
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'medium',
  className = '',
}) => {
  const sizePx = sizeMap[size];
  const iconSize = iconSizeMap[size];

  return (
    <div
      className={`shared-avatar shared-avatar-${size} ${className}`}
      style={{ width: sizePx, height: sizePx }}>
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <UserOutlined style={{ fontSize: iconSize }} />
      )}
    </div>
  );
};

