import { CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Button, Checkbox, message, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { getWidgetState, goBack, savePhoneAndGoToDetails } from '../../../lib/widget-manager';
import { branchesApi } from '../../../shared/api/branches';
import { employeesApi } from '../../../shared/api/employees';
import {
  formatDate,
  formatEmployeeFullName,
  formatPhone,
  formatTime,
  validatePhone as validatePhoneUtil,
} from '../../../shared/lib';
import { Avatar } from '../../../shared/ui';
import CustomInput from '../../../shared/ui/CustomInput';
import { Branch, Employee } from '../../../types';
import './PhoneInput.css';

export const PhoneInput: React.FC = () => {
  const [phone, setPhone] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const state = getWidgetState();

      // Загружаем филиал
      if (state.selectedBranchId) {
        try {
          const branchData = await branchesApi.getById(state.selectedBranchId);
          if (branchData) {
            setBranch(branchData);
          }
        } catch (error) {
          console.error('Ошибка загрузки филиала:', error);
        }
      }

      // Загружаем врача
      if (state.selectedEmployeeId) {
        try {
          const employeeData = await employeesApi.getById(state.selectedEmployeeId);
          if (employeeData) {
            setEmployee(employeeData);
          }
        } catch (error) {
          console.error('Ошибка загрузки врача:', error);
        }
      }

      setLoading(false);
    };

    loadData();
  }, []);

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

  const state = getWidgetState();
  const dateTime = state.selectedTimeSlot ? new Date(state.selectedTimeSlot) : null;
  const formattedDate = dateTime ? formatDate(dateTime) : '';
  const formattedTime = dateTime ? formatTime(dateTime) : '';
  const fullName = formatEmployeeFullName(employee);

  if (loading) {
    return (
      <div className='phone-input'>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Spin size='large' />
        </div>
      </div>
    );
  }

  return (
    <div className='phone-input'>
      {/* Appointment Details Container */}
      <div className='phone-input-appointment-details'>
        {/* Location */}
        {branch && (
          <div className='phone-input-location'>
            <div className='phone-input-icon-wrapper'>
              <EnvironmentOutlined className='phone-input-icon' />
            </div>
            <div className='phone-input-location-info'>
              <div className='phone-input-location-name'>{branch.name}</div>
              <div className='phone-input-location-address'>{branch.address}</div>
            </div>
          </div>
        )}

        {/* Doctor */}
        {employee && (
          <div className='phone-input-doctor'>
            <Avatar
              src={employee.photo}
              alt={fullName}
              size='medium'
              className='phone-input-doctor-avatar'
            />
            <div className='phone-input-doctor-info'>
              <div className='phone-input-doctor-name'>{fullName}</div>
              <div className='phone-input-doctor-specialization'>{employee.specialization}</div>
            </div>
          </div>
        )}

        {/* Date */}
        {dateTime && (
          <div className='phone-input-date'>
            <div className='phone-input-icon-wrapper'>
              <CalendarOutlined className='phone-input-icon' />
            </div>
            <div className='phone-input-date-info'>
              <div className='phone-input-date-text'>{formattedDate}</div>
              <div className='phone-input-time-text'>{formattedTime}</div>
            </div>
          </div>
        )}
      </div>

      {/* Phone Input Container */}
      <div className='phone-input-phone-container'>
        <div className='phone-input-phone-header'>
          <h3 className='phone-input-phone-title'>Номер телефона</h3>
        </div>
        <div className='phone-input-phone-input-container'>
          <CustomInput
            text=''
            className={` ${phoneError ? 'error' : ''}`}
            placeholder='+7 --- --- -- --'
            value={phone}
            onChange={handlePhoneChange}
            maxLength={17}
            size='large'
            autoFocus
            variant='borderless'
          />
          {phoneError && <div className='phone-input-error'>{phoneError}</div>}
        </div>
        <Checkbox checked={isNewUser} onChange={(e) => setIsNewUser(e.target.checked)}>
          Новый пользователь
        </Checkbox>
      </div>

      {/* Footer */}
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
