import React, { useState, useEffect } from 'react';
import Widget from './Widget';
import { 
  subscribeToStateChange, 
  getWidgetState,
  closeGetWellWidget 
} from '../lib/widget-manager';
import { WidgetState } from '../types';

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

  return (
    <Widget 
      open={widgetState.isOpen} 
      onClose={handleClose}
      widgetState={widgetState}
    />
  );
};

export default WidgetProvider;

