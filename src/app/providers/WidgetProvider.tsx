import { ConfigProvider } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  closeGetWellWidget,
  getWidgetState,
  openGetWellWidget,
  subscribeToStateChange
} from '../../lib/widget-manager';
import { applyTheme } from '../../shared/utils/theme';
import { WidgetState } from '../../types';
import { StickyButton, Widget } from '../../widgets/appointment-widget/ui';

const WidgetProvider: React.FC = () => {
  const [widgetState, setWidgetState] = useState<WidgetState>(getWidgetState());



  const theme = {
    dark: {
      default: '#344054',
      hover: '#1D2939',
      pressed: '#101828',

    },
    blue: {
      default: "#0142FF",
      hover: '#0037D6',
      pressed: '#002FB9'
    },
    red: {
      default: "#C01048",
      hover: '#A11043',
      pressed: '#89123E'
    },
    green: {
      default: "#039855",
      hover: '#027A48',
      pressed: '#05603A'
    },
    orange: {
      default: "#F79009",
      hover: '#DC6803',
      pressed: '#B54708'
    },
    purple: {
      default: "#752BDF",
      hover: '#601DC0',
      pressed: '#4D179A'
    },
    aqua: {
      default: "#50B7BF",
      hover: '#119AA5',
      pressed: '#0A5C63'
    }
  }
  const getTheme = {
    'dark': theme
  }

  const currentTheme = theme


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
          colorPrimary: currentTheme.dark?.default,
          colorInfo: primaryColor,
        },
        components: {
          Radio: {

            buttonSolidCheckedBg: currentTheme.dark.default,

          },
          "Segmented": {
            "itemSelectedBg": currentTheme.dark.default,
            "itemSelectedColor": "rgb(255,255,255)",
            "trackBg": "rgb(255,255,255)",
            "controlHeight": 60,
            "borderRadiusSM": 16
          }
        }
      }}>
      {!widgetState.config?.renderedAsPage && <StickyButton enabled={stickyBtnEnabled} widgetState={widgetState}
      />}
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

