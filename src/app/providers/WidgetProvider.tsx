import { ConfigProvider } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  closeGetWellWidget,
  getWidgetState,
  openGetWellWidget,
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

      // Если виджет должен отображаться как страница, автоматически открываем его после инициализации
      if (newState.config?.renderedAsPage && !newState.isOpen && newState.initialized) {
        openGetWellWidget();
      }
    });

    // Получаем начальное состояние
    const initialState = getWidgetState();
    setWidgetState(initialState);

    // Если виджет должен отображаться как страница, автоматически открываем его после инициализации
    if (initialState.config?.renderedAsPage && !initialState.isOpen && initialState.initialized) {
      openGetWellWidget();
    }

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
      {!widgetState.config?.renderedAsPage && <StickyButton enabled={stickyBtnEnabled} widgetState={widgetState} />}
      <Widget
        open={widgetState.isOpen || !!widgetState.config?.renderedAsPage}
        onClose={handleClose}
        widgetState={widgetState}
        withoutDrawer={widgetState.config?.renderedAsPage}
      />
    </ConfigProvider>
  );
};

export default WidgetProvider;

