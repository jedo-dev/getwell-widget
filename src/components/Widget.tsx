import { Drawer } from 'antd';
import React, { useEffect, useState } from 'react';
import './Widget.css';

export interface WidgetProps {
  open: boolean;
  onClose: () => void;
}

const Widget: React.FC<WidgetProps> = ({ open, onClose }) => {
  const [drawerWidth, setDrawerWidth] = useState<number | string>(400);

  useEffect(() => {
    const updateWidth = () => {
      setDrawerWidth(window.innerWidth <= 768 ? '100%' : 400);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  return (
    <Drawer
      title='Запись на приём'
      placement='right'
      onClose={onClose}
      open={open}
      width={drawerWidth}
      className='getwell-widget-drawer'>
      <div className='getwell-widget-content'>
        <div>GetWell Widget Content</div>
      </div>
    </Drawer>
  );
};

export default Widget;
