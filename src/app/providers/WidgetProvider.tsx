import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import React, { useEffect, useState } from 'react';
import {
  closeGetWellWidget,
  getWidgetState,
  openGetWellWidget,
  subscribeToStateChange,
} from '../../lib/widget-manager';
import { applyTheme, resolveTheme } from '../../shared/utils/theme';
import { WidgetState } from '../../types';
import { StickyButton, Widget } from '../../widgets/appointment-widget/ui';

dayjs.locale('ru');

const WidgetProvider: React.FC = () => {
  const [widgetState, setWidgetState] = useState<WidgetState>(getWidgetState());

  useEffect(() => {
    const unsubscribe = subscribeToStateChange((newState) => {
      setWidgetState(newState);

      if (newState.config?.theme) {
        applyTheme(newState.config.theme);
      }

      if (newState.config?.renderedAsPage && !newState.isOpen && newState.initialized) {
        openGetWellWidget();
      }
    });

    const initialState = getWidgetState();
    setWidgetState(initialState);

    if (initialState.config?.theme) {
      applyTheme(initialState.config.theme);
    }

    if (initialState.config?.renderedAsPage && !initialState.isOpen && initialState.initialized) {
      openGetWellWidget();
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const handleClose = () => {
    closeGetWellWidget();
  };

  const stickyBtnEnabled = widgetState.config?.stickyBtnEnable ?? false;
  const resolvedTheme = resolveTheme(widgetState.config?.theme);

  return (
    <ConfigProvider
      locale={ruRU}
      theme={{
        token: {
          colorPrimary: resolvedTheme.primaryColor,
          colorInfo: resolvedTheme.primaryColor,
        },
        components: {
          Button: {
            defaultShadow: 'none',
            primaryShadow: 'none',
            dangerShadow: 'none',
          },
          Radio: {
            buttonSolidCheckedBg: resolvedTheme.primaryColor,
          },
          Segmented: {
            itemSelectedBg: resolvedTheme.primaryColor,
            itemSelectedColor: 'rgb(255,255,255)',
            trackBg: 'rgb(255,255,255)',
            controlHeight: 60,
            borderRadiusSM: 16,
          },
        },
      }}>
      {!widgetState.config?.renderedAsPage && (
        <StickyButton enabled={stickyBtnEnabled} widgetState={widgetState} />
      )}
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
