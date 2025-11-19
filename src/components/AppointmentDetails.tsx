import { CalendarOutlined, CheckCircleOutlined, DownOutlined, HomeOutlined, LeftOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, DatePicker, Input, message, Radio, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { getPetsSync } from '../lib/pets-data';
import { goBack, goToAppointmentConfirmation, selectPet } from '../lib/widget-manager';
import { Branch, Employee, Pet } from '../types';
import AddPetModal from './AddPetModal';
import './AppointmentDetails.css';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { TextArea } = Input;

export interface AppointmentDetailsProps {
  selectedBranch: Branch | null;
  selectedEmployee: Employee | null;
  selectedDateTime: string | null;
  phone: string | null;
  isNewUser?: boolean;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({
  selectedBranch,
  selectedEmployee,
  selectedDateTime,
  phone: initialPhone,
  isNewUser = false,
}) => {
  const [phone, setPhone] = useState<string>(initialPhone || '');
  const [phoneError, setPhoneError] = useState<string>('');
  const [isPhoneEditing, setIsPhoneEditing] = useState<boolean>(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState<string>('');
  const [consentPersonalData, setConsentPersonalData] = useState<boolean>(false);
  const [consentMarketing, setConsentMarketing] = useState<boolean>(false);
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState<boolean>(false);

  // Поля для нового пользователя
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [patronymic, setPatronymic] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | undefined>(undefined);

  // Поля для питомца (для нового пользователя)
  const [petName, setPetName] = useState<string>('');
  const [petSpecies, setPetSpecies] = useState<string>('');
  const [petBreed, setPetBreed] = useState<string>('');
  const [petGender, setPetGender] = useState<'male' | 'female' | undefined>(undefined);
  const [petBirthDate, setPetBirthDate] = useState<Dayjs | null>(null);

  useEffect(() => {
    // Загружаем питомцев при наличии телефона (только для существующих пользователей)
    if (!isNewUser && phone && phone.replace(/[^\d]/g, '').length === 11) {
      const petsData = getPetsSync(phone);
      setPets(petsData);
      if (petsData.length > 0 && !selectedPetId) {
        const firstPetId = petsData[0].id || null;
        setSelectedPetId(firstPetId);
        if (firstPetId) {
          selectPet(firstPetId);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, isNewUser]);

  useEffect(() => {
    // Обновляем телефон при изменении из пропсов
    if (initialPhone) {
      setPhone(initialPhone);
    }
  }, [initialPhone]);

  const handleBack = () => {
    goBack();
  };

  const handlePhoneEdit = () => {
    setIsPhoneEditing(true);
  };

  const handlePhoneConfirm = () => {
    if (validatePhone()) {
      setIsPhoneEditing(false);
    }
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
      clientData: isNewUser ? {
        firstName,
        lastName,
        patronymic,
        gender,
      } : undefined,
      petId: selectedPetId,
      petData: isNewUser ? {
        name: petName,
        species: petSpecies,
        breed: petBreed,
        gender: petGender,
        birthDate: petBirthDate?.format('YYYY-MM-DD'),
      } : undefined,
      symptoms,
      consentPersonalData,
      consentMarketing,
    });

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

  const formatDate = (dateTime: string | null): { date: string; time: string } | null => {
    if (!dateTime) return null;

    const date = new Date(dateTime);
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return {
      date: `${dayName}, ${day} ${month}`,
      time: `${hours}:${minutes}`,
    };
  };

  const dateTimeInfo = formatDate(selectedDateTime);
  const fullName = selectedEmployee
    ? `${selectedEmployee.lastName} ${selectedEmployee.firstName} ${selectedEmployee.patronymic || ''}`.trim()
    : '';

  return (
    <div className="appointment-details">
      

      <div className="appointment-details-content">
        <div className="appointment-details-info">
          {selectedBranch && (
            <div className="appointment-details-card">
              <HomeOutlined className="appointment-details-card-icon" />
              <div className="appointment-details-card-content">
                <div className="appointment-details-card-title">{selectedBranch.name}</div>
                <div className="appointment-details-card-subtitle">{selectedBranch.address}</div>
              </div>
            </div>
          )}

          {selectedEmployee && (
            <div className="appointment-details-card">
              <div className="appointment-details-card-avatar">
                {selectedEmployee.photo ? (
                  <img src={selectedEmployee.photo} alt={fullName} />
                ) : (
                  <UserOutlined />
                )}
              </div>
              <div className="appointment-details-card-content">
                <div className="appointment-details-card-title">{fullName}</div>
                <div className="appointment-details-card-subtitle">{selectedEmployee.specialization}</div>
              </div>
            </div>
          )}

          {dateTimeInfo && (
            <div className="appointment-details-card">
              <CalendarOutlined className="appointment-details-card-icon" />
              <div className="appointment-details-card-content">
                <div className="appointment-details-card-title">{dateTimeInfo.date}</div>
                <div className="appointment-details-card-subtitle">{dateTimeInfo.time}</div>
              </div>
            </div>
          )}
        </div>

        <div className="appointment-details-user-data">
          <div className="appointment-details-user-data-title">Ваши данные</div>

          <div className="appointment-details-phone-section">
            {isPhoneEditing ? (
              <div className="appointment-details-phone-edit">
                <Input
                  className={`appointment-details-phone-input ${phoneError ? 'error' : ''}`}
                  placeholder="+7 --- --- -- --"
                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneConfirm}
                  maxLength={17}
                  autoFocus
                />
                {phoneError && (
                  <div className="appointment-details-phone-error">{phoneError}</div>
                )}
              </div>
            ) : (
              <div className="appointment-details-phone-display">
                <span className="appointment-details-phone-value">{phone}</span>
                <CheckCircleOutlined className="appointment-details-phone-check" />
                <button
                  className="appointment-details-phone-change"
                  onClick={handlePhoneEdit}
                >
                  изменить
                </button>
              </div>
            )}
          </div>

          {isNewUser ? (
            <>
              <div className="appointment-details-field">
                <Input
                  placeholder="Имя *"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="appointment-details-field">
                <Input
                  placeholder="Фамилия *"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="appointment-details-field">
                <Input
                  placeholder="Отчество *"
                  value={patronymic}
                  onChange={(e) => setPatronymic(e.target.value)}
                  required
                />
              </div>
              <div className="appointment-details-gender-section">
                <Radio.Group
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="appointment-details-gender-group"
                >
                  <Radio.Button value="male">Мужчина</Radio.Button>
                  <Radio.Button value="female">Женщина</Radio.Button>
                </Radio.Group>
              </div>
            </>
          ) : (
            <div className="appointment-details-pet-section">
              <Select
                className="appointment-details-pet-select"
                placeholder="Выберите питомца"
                value={selectedPetId}
                onChange={(value) => {
                  setSelectedPetId(value);
                  if (value) {
                    selectPet(value);
                  }
                }}
                suffixIcon={<DownOutlined />}
                options={pets.map(pet => ({
                  value: pet.id,
                  label: pet.name,
                }))}
              />
              <Button
                className="appointment-details-pet-add-btn"
                onClick={handleAddNewPet}
              >
                Внести нового питомца
              </Button>
            </div>
          )}

        </div>

        {isNewUser && (
          <div className="appointment-details-pet-section">
            <div className="appointment-details-pet-title">Питомец</div>
            <div className="appointment-details-field">
              <Input
                placeholder="Кличка *"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                required
              />
            </div>
            <div className="appointment-details-field">
              <Select
                placeholder="Вид *"
                value={petSpecies}
                onChange={setPetSpecies}
                suffixIcon={<DownOutlined />}
                options={[
                  { value: 'dog', label: 'Собака' },
                  { value: 'cat', label: 'Кошка' },
                  { value: 'bird', label: 'Птица' },
                  { value: 'other', label: 'Другое' },
                ]}
              />
            </div>
            <div className="appointment-details-field">
              <Select
                placeholder="Порода *"
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
            <div className="appointment-details-gender-section">
              <Radio.Group
                value={petGender}
                onChange={(e) => setPetGender(e.target.value)}
                className="appointment-details-gender-group"
              >
                <Radio.Button value="male">Самец</Radio.Button>
                <Radio.Button value="female">Самка</Radio.Button>
              </Radio.Group>
            </div>
            <div className="appointment-details-field">
              <DatePicker
                placeholder="Дата рождения *"
                value={petBirthDate}
                onChange={setPetBirthDate}
                format="DD.MM.YYYY"
                style={{ width: '100%' }}
              />
            </div>
            <div className="appointment-details-symptoms">
              <TextArea
                className="appointment-details-symptoms-input"
                placeholder="Расскажите о ваших симптомах"
                value={symptoms}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSymptoms(e.target.value)}
                rows={4}
                maxLength={500}
                showCount
              />
            </div>
          </div>
        )}

        {!isNewUser && (
          <div className="appointment-details-symptoms">
            <TextArea
              className="appointment-details-symptoms-input"
              placeholder="Расскажите о ваших симптомах"
              value={symptoms}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSymptoms(e.target.value)}
              rows={4}
              maxLength={500}
              showCount
            />
          </div>
        )}

        <div className="appointment-details-consents">
          <Checkbox
            checked={consentPersonalData}
            onChange={(e) => setConsentPersonalData(e.target.checked)}
            className="appointment-details-consent-checkbox"
          >
            Согласен на{' '}
            <a href="#" className="appointment-details-consent-link">
              обработку персональных данных
            </a>
          </Checkbox>

          <Checkbox
            checked={consentMarketing}
            onChange={(e) => setConsentMarketing(e.target.checked)}
            className="appointment-details-consent-checkbox"
          >
            Согласен на получение сообщений и информационно-рекламной рассылки
          </Checkbox>
        </div>
      </div>

      <div className="appointment-details-footer">
        <Button
          type="primary"
          className="appointment-details-submit-btn"
          block
          onClick={handleSubmit}
          disabled={
            !phone || 
            phoneError !== '' || 
            !consentPersonalData || 
            (isNewUser ? (!firstName || !lastName || !patronymic || !gender || !petName || !petSpecies || !petBreed || !petGender || !petBirthDate) : !selectedPetId)
          }
        >
          Записаться
        </Button>
      </div>

      <AddPetModal
        open={isAddPetModalOpen}
        onClose={() => setIsAddPetModalOpen(false)}
        onSave={handleSaveNewPet}
      />
    </div>
  );
};

export default AppointmentDetails;

