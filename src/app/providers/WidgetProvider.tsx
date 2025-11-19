import { ConfigProvider } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  closeGetWellWidget,
  getWidgetState,
  subscribeToStateChange
} from '../../lib/widget-manager';
import { WidgetState } from '../../types';
import { StickyButton, Widget } from '../../widgets/appointment-widget/ui';

const WidgetProvider: React.FC = () => {
  const [widgetState, setWidgetState] = useState<WidgetState>(getWidgetState());

  useEffect(() => {
    // Подписываемся на изменения состояния виджета
    const unsubscribe = subscribeToStateChange((newState) => {
      setWidgetState(newState);
    });

    // Получаем начальное состояние
    setWidgetState(getWidgetState());

    // Отписываемся при размонтировании
    return () => {
      unsubscribe();
    };
  }, []);

  const handleClose = () => {
    closeGetWellWidget();
  };

  const stickyBtnEnabled = widgetState.config?.stickyBtnEnable ?? false;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#344054',
          colorInfo: '#344054',
        },
        components: {
          "Segmented": {
            "itemSelectedBg": "rgb(52,64,84)",
            "itemSelectedColor": "rgb(255,255,255)",
            "trackBg": "rgb(255,255,255)",
            "controlHeight": 60,
            "borderRadiusSM": 16
          }
        }
      }}>
      <StickyButton enabled={stickyBtnEnabled} />
      <Widget
        open={widgetState.isOpen}
        onClose={handleClose}
        widgetState={widgetState}
      />
    </ConfigProvider>
  );
};

export default WidgetProvider;

