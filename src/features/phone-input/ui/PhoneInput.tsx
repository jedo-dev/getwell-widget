import { Button, Checkbox, Input, message } from 'antd';
import React, { useState } from 'react';
import { goBack, savePhoneAndGoToDetails } from '../../../lib/widget-manager';
import { formatPhone, validatePhone as validatePhoneUtil } from '../../../shared/lib';
import { BackButton } from '../../../shared/ui';
import './PhoneInput.css';

export const PhoneInput: React.FC = () => {
  const [phone, setPhone] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [isNewUser, setIsNewUser] = useState<boolean>(false);

  const handleBack = () => {
    goBack();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhone(value);
    setPhone(formatted);

    // Валидация
    const validation = validatePhoneUtil(formatted);
    if (!validation.isValid) {
      setPhoneError(validation.error || '');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = () => {
    const validation = validatePhoneUtil(phone);
    if (!validation.isValid) {
      setPhoneError(validation.error || '');
      message.error('Пожалуйста, введите корректный номер телефона');
      return;
    }

    savePhoneAndGoToDetails(phone, isNewUser);
  };

  return (
    <div className='phone-input'>
     

      <div className='phone-input-content'>
        <div className='phone-input-field'>
          <Input
            className={`phone-input-input ${phoneError ? 'error' : ''}`}
            placeholder='+7 --- --- -- --'
            value={phone}
            onChange={handlePhoneChange}
            maxLength={17}
            size='large'
            autoFocus
          />
          {phoneError && <div className='phone-input-error'>{phoneError}</div>}
        </div>

        <div className='phone-input-checkbox'>
          <Checkbox checked={isNewUser} onChange={(e) => setIsNewUser(e.target.checked)}>
            Новый пользователь
          </Checkbox>
        </div>
      </div>

      <div className='phone-input-footer'>
        <Button
          type='primary'
          className='phone-input-submit-btn'
          block
          onClick={handleSubmit}
          disabled={!phone || phoneError !== ''}
          size='large'>
          Далее
        </Button>
      </div>
    </div>
  );
};
