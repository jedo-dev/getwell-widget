import { Button, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import CalendarIcon from '../../../img/calendar.svg';
import LocationIcon from '../../../img/location.svg';
import { getWidgetState, goBack, savePhoneAndGoToDetails } from '../../../lib/widget-manager';
import { branchesApi } from '../../../shared/api/branches';
import { employeesApi } from '../../../shared/api/employees';
import { ownersApi } from '../../../shared/api/owners';
import {
  formatDate,
  formatEmployeeFullName,
  formatPhone,
  formatTime,
  validatePhone as validatePhoneUtil,
} from '../../../shared/lib';
import { Avatar } from '../../../shared/ui';
import CustomInput from '../../../shared/ui/CustomInput';
import IconWrapper from '../../../shared/ui/IconWrapper';
import { Branch, Employee, WidgetState } from '../../../types';
import './PhoneInput.css';

export const PhoneInput: React.FC = () => {
  const widgetState = getWidgetState();
  const showEmployeePosition = widgetState.config?.showEmployeePosition ?? true;
  const [phone, setPhone] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkingOwner, setCheckingOwner] = useState<boolean>(false);
  const [ownerData, setOwnerData] = useState<WidgetState['ownerData'] | null>(null);

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

  const handlePhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhone(value);
    setPhone(formatted);
    // Сбрасываем данные владельца при изменении телефона
    setOwnerData(null);

    // Валидация
    const validation = validatePhoneUtil(formatted);
    if (!validation.isValid) {
      setPhoneError(validation.error || '');
      setIsNewUser(false);
      return;
    }

    setPhoneError('');

    // Если телефон валиден и полностью введен, проверяем владельца
    const phoneDigits = formatted.replace(/[^\d]/g, '');
    if (phoneDigits.length === 11) {
      await checkOwner(formatted);
    } else {
      setIsNewUser(false);
    }
  };

  const checkOwner = async (phoneNumber: string) => {
    const state = getWidgetState();
    const apiUrl = state.config?.apiUrl;

    if (!apiUrl) {
      console.warn('API URL не настроен, пропускаем проверку владельца');
      setIsNewUser(true);
      setOwnerData(null);
      return;
    }

    setCheckingOwner(true);
    try {
      const response = await ownersApi.getByPhone({ apiUrl, phone: phoneNumber });

      // Если данные пришли и массив не пустой - это зарегистрированный пользователь
      if (response.data && response.data.length > 0) {
        setIsNewUser(false);
        // Сохраняем данные первого владельца
        setOwnerData(response.data[0]);
      } else {
        // Пустой массив - новый пользователь
        setIsNewUser(true);
        setOwnerData(null);
      }
    } catch (error) {
      console.error('Ошибка при проверке владельца:', error);
      // В случае ошибки считаем новым пользователем
      setIsNewUser(true);
      setOwnerData(null);
    } finally {
      setCheckingOwner(false);
    }
  };

  const handleSubmit = async () => {
    const validation = validatePhoneUtil(phone);
    if (!validation.isValid) {
      setPhoneError(validation.error || '');
      return;
    }

    // Если данные владельца уже получены, используем их
    // Если ownerData есть, значит это зарегистрированный пользователь (isNewUser = false)
    if (ownerData !== null) {
      savePhoneAndGoToDetails(phone, false, ownerData);
      return;
    }

    // Если еще не проверяли владельца, проверяем сейчас
    if (!checkingOwner) {
      const state = getWidgetState();
      const apiUrl = state.config?.apiUrl;

      if (apiUrl) {
        setCheckingOwner(true);
        try {
          const response = await ownersApi.getByPhone({ apiUrl, phone });

          if (response.data && response.data.length > 0) {
            // Зарегистрированный пользователь - сохраняем данные первого владельца
            const owner = response.data[0];
            savePhoneAndGoToDetails(phone, false, owner);
          } else {
            // Новый пользователь
            savePhoneAndGoToDetails(phone, true);
          }
        } catch (error) {
          console.error('Ошибка при проверке владельца:', error);
          // В случае ошибки считаем новым пользователем
          savePhoneAndGoToDetails(phone, true);
        } finally {
          setCheckingOwner(false);
        }
      } else {
        // Если API URL не настроен, просто сохраняем как новый пользователь
        savePhoneAndGoToDetails(phone, isNewUser);
      }
    }
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
              <IconWrapper src={LocationIcon} size={48} withBackground={false} />
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
              {showEmployeePosition && (
                <div className='phone-input-doctor-specialization'>{employee.specialization}</div>
              )}
            </div>
          </div>
        )}

        {/* Date */}
        {dateTime && (
          <div className='phone-input-date'>
            <div className='phone-input-icon-wrapper'>
              <IconWrapper src={CalendarIcon} size={48} withBackground={false} />
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
          <h3 className='phone-input-phone-title'>Введите номер телефона</h3>
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
        {/* <Checkbox
          checked={isNewUser}
          onChange={(e) => setIsNewUser(e.target.checked)}
          disabled={checkingOwner}>
          Новый пользователь
        </Checkbox> */}
      </div>

      {/* Footer */}
      <div className='phone-input-footer'>
        <Button
          type='primary'
          className='phone-input-submit-btn'
          block
          onClick={handleSubmit}
          disabled={checkingOwner}
          loading={checkingOwner}
          size='large'>
          Записаться
        </Button>
      </div>
    </div>
  );
};
