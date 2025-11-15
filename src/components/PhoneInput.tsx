import React, { useState } from 'react';
import { LeftOutlined } from '@ant-design/icons';
import { Input, Button, message } from 'antd';
import { goBack, savePhoneAndGoToDetails } from '../lib/widget-manager';
import './PhoneInput.css';

const PhoneInput: React.FC = () => {
  const [phone, setPhone] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  const handleBack = () => {
    goBack();
  };

  const formatPhone = (value: string): string => {
    // Удаляем все нецифровые символы
    const digits = value.replace(/[^\d]/g, '');

    // Если начинается с 8, заменяем на 7
    let formatted = digits.startsWith('8') ? '7' + digits.slice(1) : digits;

    // Ограничиваем до 11 цифр (7 + 10)
    if (formatted.length > 11) {
      formatted = formatted.slice(0, 11);
    }

    // Форматируем: +7 XXX XXX XX XX
    if (formatted.length === 0) {
      return '';
    }

    if (formatted.length <= 1) {
      return `+${formatted}`;
    }

    if (formatted.length <= 4) {
      return `+${formatted.slice(0, 1)} ${formatted.slice(1)}`;
    }

    if (formatted.length <= 7) {
      return `+${formatted.slice(0, 1)} ${formatted.slice(1, 4)} ${formatted.slice(4)}`;
    }

    if (formatted.length <= 9) {
      return `+${formatted.slice(0, 1)} ${formatted.slice(1, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7)}`;
    }

    return `+${formatted.slice(0, 1)} ${formatted.slice(1, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7, 9)} ${formatted.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhone(value);
    setPhone(formatted);

    // Валидация
    const digits = formatted.replace(/[^\d]/g, '');
    if (digits.length > 0 && digits.length < 11) {
      setPhoneError('Введите корректный номер телефона');
    } else if (digits.length === 11 && !digits.startsWith('7')) {
      setPhoneError('Номер должен начинаться с +7');
    } else {
      setPhoneError('');
    }
  };

  const validatePhone = (): boolean => {
    const digits = phone.replace(/[^\d]/g, '');

    if (digits.length !== 11) {
      setPhoneError('Введите корректный номер телефона');
      return false;
    }

    if (!digits.startsWith('7')) {
      setPhoneError('Номер должен начинаться с +7');
      return false;
    }

    setPhoneError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validatePhone()) {
      message.error('Пожалуйста, введите корректный номер телефона');
      return;
    }

    savePhoneAndGoToDetails(phone);
  };

  return (
    <div className="phone-input">
      <div className="phone-input-header">
        <LeftOutlined className="phone-input-back" onClick={handleBack} />
        <h2 className="phone-input-title">Введите номер телефона</h2>
      </div>

      <div className="phone-input-content">
        <div className="phone-input-field">
          <Input
            className={`phone-input-input ${phoneError ? 'error' : ''}`}
            placeholder="+7 --- --- -- --"
            value={phone}
            onChange={handlePhoneChange}
            maxLength={17}
            size="large"
            autoFocus
          />
          {phoneError && (
            <div className="phone-input-error">{phoneError}</div>
          )}
        </div>
      </div>

      <div className="phone-input-footer">
        <Button
          type="primary"
          className="phone-input-submit-btn"
          block
          onClick={handleSubmit}
          disabled={!phone || phoneError !== ''}
          size="large"
        >
          Далее
        </Button>
      </div>
    </div>
  );
};

export default PhoneInput;

