import { ConfigProvider } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  closeGetWellWidget,
  getWidgetState,
  openGetWellWidget,
  subscribeToStateChange
} from '../../lib/widget-manager';
import { WidgetState } from '../../types';
import { applyTheme } from '../../shared/utils/theme';
import { StickyButton, Widget } from '../../widgets/appointment-widget/ui';

const WidgetProvider: React.FC = () => {
  const [widgetState, setWidgetState] = useState<WidgetState>(getWidgetState());

  useEffect(() => {
    // Подписываемся на изменения состояния виджета
    const unsubscribe = subscribeToStateChange((newState) => {
      setWidgetState(newState);

      // Применяем тему при изменении конфига
      if (newState.config?.theme) {
        applyTheme(newState.config.theme);
      }

      // Если виджет должен отображаться как страница, автоматически открываем его после инициализации
      if (newState.config?.renderedAsPage && !newState.isOpen && newState.initialized) {
        openGetWellWidget();
      }
    });

    // Получаем начальное состояние
    const initialState = getWidgetState();
    setWidgetState(initialState);

    // Применяем тему при инициализации
    if (initialState.config?.theme) {
      applyTheme(initialState.config.theme);
    }

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

  const primaryColor = widgetState.config?.theme?.primaryColor || '#344054';

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryColor,
          colorInfo: primaryColor,
        },
        components: {
          "Segmented": {
            "itemSelectedBg": primaryColor,
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

