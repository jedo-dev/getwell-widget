import {
  CalendarOutlined,
  DownOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { Button, Checkbox, message, Radio, Spin } from 'antd';
import type { Dayjs } from 'dayjs';
import React, { useEffect, useState } from 'react';
import { getWidgetState, goBack, goToAppointmentConfirmation, goToPrivacyPolicy, selectPet } from '../../../lib/widget-manager';
import { recordsApi } from '../../../shared/api';
import { petsApi } from '../../../shared/api/pets';
import {
  Gender,
  GENDER_LABELS,
  PET_GENDER_LABELS,
  PET_SPECIES_OPTIONS,
  PetSpecies,
} from '../../../shared/constants';
import {
  formatDate,
  formatDateTime,
  formatEmployeeFullName,
  formatPhone,
  formatTime,
  validatePhone as validatePhoneUtil,
} from '../../../shared/lib';
import { Avatar } from '../../../shared/ui';
import CustomDatepicker from '../../../shared/ui/CustomDatepicker';
import CustomInput from '../../../shared/ui/CustomInput';
import CustomSelector from '../../../shared/ui/CustomSelector';
import CustomTextArea from '../../../shared/ui/CustomTextArea';
import { Branch, Employee, Pet } from '../../../types';
import { AddPetModal } from '../../pet-management';
import './AppointmentDetails.css';


export interface AppointmentDetailsProps {
  selectedBranch: Branch | null;
  selectedEmployee: Employee | null;
  selectedDateTime: string | null;
  phone: string | null;
  isNewUser?: boolean;
}

export const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({
  selectedBranch,
  selectedEmployee,
  selectedDateTime,
  phone: initialPhone,
  isNewUser = false,
}) => {
  const widgetState = getWidgetState();
  const showEmployeePosition = widgetState.config?.showEmployeePosition ?? true;
  const [phone, setPhone] = useState<string>(initialPhone || '');
  const [phoneError, setPhoneError] = useState<string>('');
  const [isPhoneEditing, setIsPhoneEditing] = useState<boolean>(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [loadingPets, setLoadingPets] = useState<boolean>(false);
  const [symptoms, setSymptoms] = useState<string>('');
  const [consentPersonalData, setConsentPersonalData] = useState<boolean>(false);
  const [consentMarketing, setConsentMarketing] = useState<boolean>(false);
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState<boolean>(false);

  // Поля для нового пользователя
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [patronymic, setPatronymic] = useState<string>('');
  const [gender, setGender] = useState<Gender | undefined>(Gender.MALE);

  // Поля для питомца (для нового пользователя)
  const [petName, setPetName] = useState<string>('');
  const [petSpecies, setPetSpecies] = useState<PetSpecies | string>('');
  const [petBreed, setPetBreed] = useState<string>('');
  const [petGender, setPetGender] = useState<Gender | undefined>(Gender.MALE);
  const [petBirthDate, setPetBirthDate] = useState<Dayjs | null>(null);

  useEffect(() => {
    // Загружаем питомцев при наличии телефона (только для существующих пользователей)
    if (!isNewUser && phone && phone.replace(/[^\d]/g, '').length === 11) {
      const loadPets = async () => {
        setLoadingPets(true);
        try {
          const response = await petsApi.getByPhone(phone);
          if (response.success && response.data) {
            setPets(response.data);
            if (response.data.length > 0 && !selectedPetId) {
              const firstPetId = response.data[0].id || null;
              setSelectedPetId(firstPetId);
              if (firstPetId) {
                selectPet(firstPetId);
              }
            }
          }
        } catch (error) {
          console.error('Ошибка загрузки питомцев:', error);
        } finally {
          setLoadingPets(false);
        }
      };
      loadPets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, isNewUser]);

  useEffect(() => {
    // Обновляем телефон при изменении из пропсов
    if (initialPhone) {
      setPhone(initialPhone);
    }
  }, [initialPhone]);

  const handlePhoneEdit = () => {
    setIsPhoneEditing(true);
  };

  const handlePhoneConfirm = () => {
    if (validatePhone()) {
      setIsPhoneEditing(false);
    }
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

  const validatePhone = (): boolean => {
    const validation = validatePhoneUtil(phone);
    if (!validation.isValid) {
      setPhoneError(validation.error || '');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validatePhone()) {
      message.error('Пожалуйста, введите корректный номер телефона');
      return;
    }

    if (isNewUser) {
      // Валидация для нового пользователя
      if (!firstName.trim()) {
        message.error('Пожалуйста, введите имя');
        return;
      }
      if (!lastName.trim()) {
        message.error('Пожалуйста, введите фамилию');
        return;
      }
      if (!patronymic.trim()) {
        message.error('Пожалуйста, введите отчество');
        return;
      }
      if (!gender) {
        message.error('Пожалуйста, выберите пол');
        return;
      }
      if (!petName.trim()) {
        message.error('Пожалуйста, введите кличку питомца');
        return;
      }
      if (!petSpecies) {
        message.error('Пожалуйста, выберите вид питомца');
        return;
      }
      if (!petBreed) {
        message.error('Пожалуйста, выберите породу питомца');
        return;
      }
      if (!petGender) {
        message.error('Пожалуйста, выберите пол питомца');
        return;
      }
      if (!petBirthDate) {
        message.error('Пожалуйста, выберите дату рождения питомца');
        return;
      }
    } else {
      // Валидация для существующего пользователя
      if (!selectedPetId) {
        message.error('Пожалуйста, выберите питомца');
        return;
      }
    }

    if (!consentPersonalData) {
      message.error('Необходимо согласие на обработку персональных данных');
      return;
    }

    // TODO: Отправка данных на сервер
    console.log('Appointment data:', {
      branch: selectedBranch,
      employee: selectedEmployee,
      dateTime: selectedDateTime,
      phone: phone.replace(/[^\d]/g, ''),
      isNewUser,
      clientData: isNewUser
        ? {
          firstName,
          lastName,
          patronymic,
          gender,
        }
        : undefined,
      petId: selectedPetId,
      petData: isNewUser
        ? {
          name: petName,
          species: petSpecies,
          breed: petBreed,
          gender: petGender,
          birthDate: petBirthDate?.format('YYYY-MM-DD'),
        }
        : undefined,
      symptoms,
      consentPersonalData,
      consentMarketing,
    });

    // Создание записи в онлайн-режиме (минимальный payload)
    const state = getWidgetState();
    const apiUrl = state.config?.apiUrl;
    const toIso = state.selectedTimeSlotTo;
    const departmentId = state.selectedDepartmentId;

    if (!state.config?.offlineMode && apiUrl && selectedEmployee && selectedDateTime && toIso && departmentId) {
      try {
        // backend ожидает "YYYY-MM-DD HH:mm:ss" в локальной TZ браузера
        const isoToLocal = async (iso: string): Promise<string> => {
          const d = new Date(iso);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const hh = String(d.getHours()).padStart(2, '0');
          const mm = String(d.getMinutes()).padStart(2, '0');
          const ss = String(d.getSeconds()).padStart(2, '0');
          return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
        };

        await recordsApi.createRecord({
          apiUrl,
          payload: {
            appointment: {
              department_id: departmentId,
              employee_id: selectedEmployee.id,
              from: await isoToLocal(selectedDateTime),
              to: await isoToLocal(toIso),
              comment: symptoms || undefined,
            },
          },
        });
      } catch (e) {
        // Не блокируем UX: показываем подтверждение даже если запись не сохранилась.
        console.error('Ошибка создания записи:', e);
      }
    }

    // Переход к экрану подтверждения
    goToAppointmentConfirmation();
  };

  const handleAddNewPet = () => {
    setIsAddPetModalOpen(true);
  };

  const handleSaveNewPet = (pet: Omit<Pet, 'id'>) => {
    // TODO: В будущем здесь будет запрос к API для сохранения питомца
    const newPet: Pet = {
      ...pet,
      id: Date.now(), // Временный ID
    };
    setPets([...pets, newPet]);
    const newPetId = newPet.id || null;
    setSelectedPetId(newPetId);
    if (newPetId) {
      selectPet(newPetId);
    }
  };

  const dateTimeInfo = formatDateTime(selectedDateTime);
  const fullName = selectedEmployee ? formatEmployeeFullName(selectedEmployee) : '';
  const dateTime = selectedDateTime ? new Date(selectedDateTime) : null;
  const formattedDate = dateTime ? formatDate(dateTime) : '';
  const formattedTime = dateTime ? formatTime(dateTime) : '';

  const handleBack = () => {
    goBack();
  };

  return (
    <div className='appointment-details'>
      <AddPetModal
        open={isAddPetModalOpen}
        onClose={() => setIsAddPetModalOpen(false)}
        onSave={handleSaveNewPet}
      />
      <div className='appointment-details-content'>
        {/* Appointment Details Container */}
        <div className='appointment-details-appointment-details'>
          {/* Location */}
          {selectedBranch && (
            <div className='appointment-details-location'>
              <div className='appointment-details-icon-wrapper'>
                <EnvironmentOutlined className='appointment-details-icon' />
              </div>
              <div className='appointment-details-location-info'>
                <div className='appointment-details-location-name'>{selectedBranch.name}</div>
                <div className='appointment-details-location-address'>{selectedBranch.address}</div>
              </div>
            </div>
          )}

          {/* Doctor */}
          {selectedEmployee && (
            <div className='appointment-details-doctor'>
              <Avatar
                src={selectedEmployee.photo}
                alt={fullName}
                size='medium'
                className='appointment-details-doctor-avatar'
              />
              <div className='appointment-details-doctor-info'>
                <div className='appointment-details-doctor-name'>{fullName}</div>
                {showEmployeePosition && (
                  <div className='appointment-details-doctor-specialization'>
                    {selectedEmployee.specialization}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Date */}
          {dateTimeInfo && (
            <div className='appointment-details-date'>
              <div className='appointment-details-icon-wrapper'>
                <CalendarOutlined className='appointment-details-icon' />
              </div>
              <div className='appointment-details-date-info'>
                <div className='appointment-details-date-text'>{formattedDate}</div>
                <div className='appointment-details-time-text'>{formattedTime}</div>
              </div>
            </div>
          )}
        </div>

        <div className='appointment-details-user-data'>
          <div className='appointment-details-user-data-title'>Ваши данные</div>

          {/* Phone Input */}
          <div className='appointment-details-phone-section'>
            {isPhoneEditing ? (
              <div className='appointment-details-phone-edit'>
                <CustomInput
                  text='Телефон'

                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneConfirm}
                  maxLength={17}
                  size='large'
                  autoFocus
                />
                {phoneError && <div className='appointment-details-phone-error'>{phoneError}</div>}
              </div>
            ) : (
              <div className='appointment-details-phone-display'>
                <div className='appointment-details-phone-display-content'>
                  <span className='appointment-details-phone-code'>+7</span>
                  <span className='appointment-details-phone-number'>
                    {phone ? phone.replace(/^\+7\s?/, '') : ''}
                  </span>

                  <button className='appointment-details-phone-change' onClick={handlePhoneEdit}>
                    изменить
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Name Input */}
          {isNewUser ? (
            <>
              <div className='appointment-details-field'>
                <CustomInput
                  text='Имя'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}

                  required
                />
              </div>
              <div className='appointment-details-field'>
                <CustomInput
                  text='Фамилия'
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}

                  required
                />
              </div>
              <div className='appointment-details-field'>
                <CustomInput
                  text='Отчество'
                  value={patronymic}
                  onChange={(e) => setPatronymic(e.target.value)}

                  required
                />
              </div>
              <div className='appointment-details-gender-section'>
                <Radio.Group
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className='appointment-details-gender-group'>
                  <Radio.Button value={Gender.MALE}>{GENDER_LABELS[Gender.MALE]}</Radio.Button>
                  <Radio.Button value={Gender.FEMALE}>{GENDER_LABELS[Gender.FEMALE]}</Radio.Button>
                </Radio.Group>
              </div>
            </>
          ) : (
            <div className='appointment-details-pet-section'>
              {loadingPets ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                  <Spin />
                </div>
              ) : (
                <>
                  <CustomSelector
                    text='Питомец'
                    className='appointment-details-pet-select'
                    value={selectedPetId}
                    onChange={(value) => {
                      setSelectedPetId(value);
                      if (value) {
                        selectPet(value);
                      }
                    }}
                    suffixIcon={<DownOutlined />}
                    options={pets.map((pet) => ({
                      value: pet.id,
                      label: pet.name,
                    }))}
                  />
                  <Button className='appointment-details-pet-add-btn' onClick={handleAddNewPet}>
                    Внести нового питомца
                  </Button>

                  <CustomTextArea
                    text='Расскажите о ваших симптомах'
                    value={symptoms}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setSymptoms(e.target.value)
                    }
                    rows={1}
                  />
                </>
              )}
            </div>
          )}

          {isNewUser && (
            <div className='appointment-details-pet-section'>
              <div className='appointment-details-pet-title'>Питомец</div>
              <div className='appointment-details-field'>
                <CustomInput
                  text='Кличка'
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  required
                />
              </div>
              <div className='appointment-details-field'>
                <CustomSelector
                  text='Вид'
                  value={petSpecies}
                  onChange={setPetSpecies}
                  options={PET_SPECIES_OPTIONS}
                  suffixIcon={<DownOutlined />}
                />
              </div>

              <div className='appointment-details-field'>
                <CustomSelector
                  text='Порода'
                  value={petBreed}
                  onChange={setPetBreed}
                  suffixIcon={<DownOutlined />}
                  options={[
                    { value: 'breed1', label: 'Порода 1' },
                    { value: 'breed2', label: 'Порода 2' },
                    { value: 'breed3', label: 'Порода 3' },
                  ]}
                />
              </div>
              <div className='appointment-details-gender-section'>
                <Radio.Group
                  value={petGender}

                  onChange={(e) => setPetGender(e.target.value)}
                  className='appointment-details-gender-group'>
                  <Radio.Button value={Gender.MALE}>{PET_GENDER_LABELS[Gender.MALE]}</Radio.Button>
                  <Radio.Button value={Gender.FEMALE}>
                    {PET_GENDER_LABELS[Gender.FEMALE]}
                  </Radio.Button>
                </Radio.Group>
              </div>
              <div className='appointment-details-field'>
                <CustomDatepicker
                  text='Дата рождения *'
                  value={petBirthDate}
                  onChange={setPetBirthDate}
                  format='DD.MM.YYYY'
                  style={{ width: '100%' }}
                />
              </div>
              <div className='appointment-details-field'>
                <CustomTextArea
                  text='Расскажите о ваших симптомах'
                  value={symptoms}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setSymptoms(e.target.value)
                  }
                  rows={1}
                />
              </div>
            </div>
          )}
          <div className='appointment-details-consents'>
            <Checkbox
              checked={consentPersonalData}
              onChange={(e) => setConsentPersonalData(e.target.checked)}
              className='appointment-details-consent-checkbox'>
              Согласен на{' '}
              <a
                href={widgetState.config?.isExternalLinkPolicy ? widgetState.config?.linkToExternalPolicy : '#'}
                className='appointment-details-consent-link'
                onClick={(e) => {
                  if (!widgetState.config?.isExternalLinkPolicy) {
                    e.preventDefault();
                    goToPrivacyPolicy();
                  }
                }}
                target={widgetState.config?.isExternalLinkPolicy ? '_blank' : undefined}
                rel={widgetState.config?.isExternalLinkPolicy ? 'noopener noreferrer' : undefined}>
                обработку персональных данных
              </a>
            </Checkbox>

            <Checkbox
              checked={consentMarketing}
              onChange={(e) => setConsentMarketing(e.target.checked)}
              className='appointment-details-consent-checkbox'>
              Согласен на получение сообщений и информационно-рекламной рассылки
            </Checkbox>
          </div>

          <div className='appointment-details-footer'>
            <Button
              type='primary'
              className='appointment-details-submit-btn'
              block
              onClick={handleSubmit}
              disabled={
                !phone ||
                phoneError !== '' ||
                !consentPersonalData ||
                (isNewUser
                  ? !firstName ||
                  !lastName ||
                  !patronymic ||
                  !gender ||
                  !petName ||
                  !petSpecies ||
                  !petBreed ||
                  !petGender ||
                  !petBirthDate
                  : !selectedPetId)
              }>
              Записаться
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
