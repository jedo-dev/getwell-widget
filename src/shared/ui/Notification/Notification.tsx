import { CloseOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './Notification.css';

export interface NotificationProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  duration?: number; // в миллисекундах, 0 = не исчезает автоматически
  onClose?: () => void;
}

export const Notification: React.FC<NotificationProps> = ({
  message,
  type = 'error',
  duration = 5000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          onClose?.();
        }, 300); // время для анимации исчезновения
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  if (!visible) {
    return null;
  }

  const notificationContent = (
    <div className={`notification notification-${type} ${visible ? 'notification-visible' : 'notification-hidden'}`}>
      <div className="notification-content">
        <div className="notification-message">{message}</div>
        <button className="notification-close" onClick={handleClose} aria-label="Закрыть">
          <CloseOutlined />
        </button>
      </div>
    </div>
  );

  // Рендерим через Portal в body, чтобы нотификация была поверх всех элементов
  if (typeof window !== 'undefined' && document.body) {
    return createPortal(notificationContent, document.body);
  }

  return notificationContent;
};
