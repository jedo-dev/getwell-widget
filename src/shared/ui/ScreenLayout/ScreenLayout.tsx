import React from 'react';
import './ScreenLayout.css';

interface ScreenLayoutProps {
  className?: string;
  top?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
  topClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  className,
  top,
  content,
  footer,
  topClassName,
  contentClassName,
  footerClassName,
}) => {
  return (
    <div className={`gw-screen-layout ${className || ''}`.trim()}>
      {top ? <div className={`gw-screen-layout__top ${topClassName || ''}`.trim()}>{top}</div> : null}
      <div className={`gw-screen-layout__content ${contentClassName || ''}`.trim()}>{content}</div>
      {footer ? (
        <div className={`gw-screen-layout__footer ${footerClassName || ''}`.trim()}>{footer}</div>
      ) : null}
    </div>
  );
};
