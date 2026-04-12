import { CheckOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Checkbox, message, Radio, Spin } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import CalendarIcon from '../../../img/calendar.svg';
import {
  getWidgetState,
  goBack,
  goToAppointmentConfirmation,
  goToPrivacyPolicy,
  saveAppointmentDetailsDraft,
  selectBreed,
  selectPatientType,
  selectPet,
  subscribeToStateChange,
} from '../../../lib/widget-manager';
import { patientsApi, recordsApi } from '../../../shared/api';
import { petsApi } from '../../../shared/api/pets';
import { Gender, GENDER_LABELS, PetSpecies } from '../../../shared/constants';
import { usePetGenders } from '../../../shared/hooks/usePetGenders';
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
import IconWrapper from '../../../shared/ui/IconWrapper';
import { Branch, Breed, Employee, PatientType, Pet, WidgetState } from '../../../types';
import { AddPetModal } from '../../pet-management';
import './AppointmentDetails.css';

import LocationIcon from '../../../img/location.svg';

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
  const normalizeGenderValue = (value?: string | null): Gender | undefined => {
    if (!value) {
      return undefined;
    }

    const normalized = value.trim().toLowerCase();
    if (
      normalized === Gender.MALE ||
      normalized === 'мужской' ||
      normalized === 'мужчина' ||
      normalized === 'самец'
    ) {
      return Gender.MALE;
    }

    if (
      normalized === Gender.FEMALE ||
      normalized === 'женский' ||
      normalized === 'женщина' ||
      normalized === 'самка'
    ) {
      return Gender.FEMALE;
    }

    return undefined;
  };

  const maxBirthDate = dayjs().endOf('day');
  const widgetState = getWidgetState();
  const appointmentDetailsDraft = widgetState.appointmentDetailsDraft;
  const showEmployeePosition = widgetState.config?.showEmployeePosition ?? true;
  const { genders: petGenders, getLabel: getPetGenderLabel, getId } = usePetGenders();
  const [ownerData, setOwnerData] = useState<WidgetState['ownerData'] | null>(
    widgetState.ownerData ?? null,
  );
  const [phone, setPhone] = useState<string>(initialPhone || '');
  const [phoneError, setPhoneError] = useState<string>('');
  const [isPhoneEditing, setIsPhoneEditing] = useState<boolean>(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(
    appointmentDetailsDraft?.selectedPetId ?? widgetState.selectedPetId ?? null,
  );
  const [loadingPets, setLoadingPets] = useState<boolean>(false);
  const [symptoms, setSymptoms] = useState<string>(appointmentDetailsDraft?.symptoms || '');
  const [consentPersonalData, setConsentPersonalData] = useState<boolean>(
    appointmentDetailsDraft?.consentPersonalData ?? false,
  );
  const [consentMarketing, setConsentMarketing] = useState<boolean>(
    appointmentDetailsDraft?.consentMarketing ?? false,
  );
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState<boolean>(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);

  // Поля для нового пользователя
  const [firstName, setFirstName] = useState<string>(appointmentDetailsDraft?.firstName || '');
  const [lastName, setLastName] = useState<string>(appointmentDetailsDraft?.lastName || '');
  const [patronymic, setPatronymic] = useState<string>(appointmentDetailsDraft?.patronymic || '');
  const [gender, setGender] = useState<Gender | undefined>(
    appointmentDetailsDraft?.gender ?? Gender.MALE,
  );

  // Поля для питомца (для нового пользователя)
  const [petName, setPetName] = useState<string>(appointmentDetailsDraft?.petName || '');
  const [petSpecies, setPetSpecies] = useState<PetSpecies | string>(
    appointmentDetailsDraft?.petSpecies || '',
  );
  const [petBreed, setPetBreed] = useState<string>(appointmentDetailsDraft?.petBreed || '');
  const [petGender, setPetGender] = useState<Gender | undefined>(
    normalizeGenderValue(appointmentDetailsDraft?.petGender) || Gender.FEMALE,
  );
  const [petBirthDate, setPetBirthDate] = useState<Dayjs | null>(
    appointmentDetailsDraft?.petBirthDate ? dayjs(appointmentDetailsDraft.petBirthDate) : null,
  );

  // Состояние для пород и типов животных
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loadingBreeds, setLoadingBreeds] = useState<boolean>(false);
  const [breedsError, setBreedsError] = useState<string | null>(null);

  // Локальное состояние для синхронизации с виджетом
  const [selectedPatientTypeId, setSelectedPatientTypeId] = useState<number | undefined>(
    appointmentDetailsDraft?.selectedPatientTypeId ?? getWidgetState().selectedPatientTypeId,
  );
  const [selectedBreedId, setSelectedBreedId] = useState<number | undefined>(
    appointmentDetailsDraft?.selectedBreedId ?? getWidgetState().selectedBreedId,
  );

  // Синхронизация с состоянием виджета
  useEffect(() => {
    const unsubscribe = subscribeToStateChange((state) => {
      setSelectedPatientTypeId(state.selectedPatientTypeId);
      setSelectedBreedId(state.selectedBreedId);
      setOwnerData(state.ownerData ?? null);
    });
    return unsubscribe;
  }, []);

  // Строим списки типов животных и пород
  const patientTypes = useMemo<PatientType[]>(() => {
    const typeMap = new Map<number, PatientType>();
    breeds.forEach((breed) => {
      if (!typeMap.has(breed.patient_type.id)) {
        typeMap.set(breed.patient_type.id, breed.patient_type);
      }
    });
    return Array.from(typeMap.values());
  }, [breeds]);

  const breedsByTypeId = useMemo<Record<number, Breed[]>>(() => {
    const result: Record<number, Breed[]> = {};
    breeds.forEach((breed) => {
      const typeId = breed.patient_type.id;
      if (!result[typeId]) {
        result[typeId] = [];
      }
      result[typeId].push(breed);
    });
    return result;
  }, [breeds]);

  const availableBreeds = selectedPatientTypeId ? breedsByTypeId[selectedPatientTypeId] || [] : [];

  // Инициализируем petGender первым элементом из petGenders, когда они загрузятся
  useEffect(() => {
    if (!petGenders.length) {
      return;
    }
    const normalizedCurrentGender = normalizeGenderValue(petGender);
    const hasCurrentGender = petGenders.some(
      (g) => g.code === normalizedCurrentGender || normalizeGenderValue(g.name) === normalizedCurrentGender,
    );
    if (!hasCurrentGender || !normalizedCurrentGender) {
      setPetGender(Gender.FEMALE);
      return;
    }
    setPetGender(normalizedCurrentGender);
  }, [petGenders, petGender]);

  useEffect(() => {
    // Если есть данные владельца, используем их
    if (ownerData && ownerData.patients) {
      if (ownerData.patients.length > 0) {
        // Преобразуем patients в формат Pet
        const petsFromOwner: Pet[] = ownerData.patients.map((patient) => {
          // Преобразуем gender из API формата в Gender enum
          const patientGender =
            patient.gender.name.toLowerCase() === 'male' ? Gender.MALE : Gender.FEMALE;

          return {
            id: patient.id,
            name: patient.nickname,
            species: patient.breed.patient_type.name,
            breed: patient.breed.name,
            gender: patientGender,
            birthDate: patient.birth_date,
          };
        });

        setPets(petsFromOwner);
        if (petsFromOwner.length > 0) {
          const hasSelected = selectedPetId
            ? petsFromOwner.some((pet) => pet.id === selectedPetId)
            : false;
          const nextPetId = hasSelected ? selectedPetId : petsFromOwner[0].id || null;
          if (nextPetId !== selectedPetId) {
            setSelectedPetId(nextPetId);
          }
          if (nextPetId) {
            selectPet(nextPetId);
          }
        }
      } else {
        // Если массив пустой, очищаем список питомцев
        setPets([]);
        setSelectedPetId(null);
      }
      setLoadingPets(false);
    } else if (!isNewUser && phone && phone.replace(/[^\d]/g, '').length === 11) {
      // Fallback: загружаем питомцев через API, если нет данных владельца
      const loadPets = async () => {
        setLoadingPets(true);
        try {
          const response = await petsApi.getByPhone(phone);
          if (response.success && response.data) {
            setPets(response.data);
            if (response.data.length > 0) {
              const hasSelected = selectedPetId
                ? response.data.some((pet) => pet.id === selectedPetId)
                : false;
              const nextPetId = hasSelected ? selectedPetId : response.data[0].id || null;
              if (nextPetId !== selectedPetId) {
                setSelectedPetId(nextPetId);
              }
              if (nextPetId) {
                selectPet(nextPetId);
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

  useEffect(() => {
    // Заполняем данные пользователя из ownerData, если они есть
    if (ownerData && !isNewUser) {
      // Заполняем поля пользователя из ownerData
      if (ownerData.name && !firstName) {
        setFirstName(ownerData.name);
      }
      if (ownerData.surname && !lastName) {
        setLastName(ownerData.surname);
      }
      if (ownerData.patronymic && !patronymic) {
        setPatronymic(ownerData.patronymic);
      }
      if (ownerData.gender && !gender) {
        // Преобразуем 'male'/'female' в Gender enum
        const ownerGender = ownerData.gender === 'male' ? Gender.MALE : Gender.FEMALE;
        setGender(ownerGender);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewUser, ownerData, firstName, lastName, patronymic, gender]);

  // Загрузка пород при входе на шаг (только для нового пользователя и в online режиме)
  useEffect(() => {
    if (!isNewUser) return;

    const state = getWidgetState();
    const config = state.config;
    const isOffline = config?.offlineMode === true;

    // В offline режиме используем данные из конфига, если они есть
    if (isOffline) {
      // TODO: поддержка config.patientTypes и config.breeds в будущем
      setBreeds([]);
      return;
    }

    // В online режиме загружаем породы
    const apiUrl = config?.apiUrl;
    if (!apiUrl) {
      setBreeds([]);
      return;
    }

    const loadBreeds = async () => {
      setLoadingBreeds(true);
      setBreedsError(null);
      try {
        const breedsData = await patientsApi.getBreeds(apiUrl);
        setBreeds(breedsData);
      } catch (error) {
        console.error('Ошибка загрузки пород:', error);
        setBreedsError('Не удалось загрузить породы');
        setBreeds([]);
      } finally {
        setLoadingBreeds(false);
      }
    };

    loadBreeds();
  }, [isNewUser]);

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
    setHasAttemptedSubmit(true);

    const phoneValidation = validatePhoneUtil(phone);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error || '');
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
      if (!selectedPatientTypeId) {
        message.error('Пожалуйста, выберите вид');
        return;
      }
      if (!selectedBreedId) {
        message.error('Пожалуйста, выберите породу');
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

    // Создание записи в онлайн-режиме
    const state = getWidgetState();
    const apiUrl = state.config?.apiUrl;
    const toIso = state.selectedTimeSlotTo;
    const departmentId = state.selectedDepartmentId;

    if (
      !state.config?.offlineMode &&
      apiUrl &&
      selectedEmployee &&
      selectedDateTime &&
      toIso &&
      departmentId
    ) {
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

        const appointmentData = {
          department_id: departmentId,
          employee_id: selectedEmployee.id,
          from: await isoToLocal(selectedDateTime),
          to: await isoToLocal(toIso),
          comment: symptoms || undefined,
          rsrv_timeslot_unq_hash: state.reservedTimeslotHash || undefined,
        };

        // Определяем, какой вариант запроса использовать
        const ownerData = state.ownerData;
        let payload;

        const selectedPet = pets.find((pet) => pet.id === selectedPetId);

        if (!isNewUser && ownerData?.id && selectedPetId && !selectedPet?.isLocal) {
          // Вариант для авторизованного пользователя: используем ID
          payload = {
            appointment: appointmentData,
            patient_id: selectedPetId,
            owner_id: ownerData.id,
          };
        } else if (!isNewUser && ownerData?.id && selectedPet?.isLocal) {
          const petGenderItem = petGenders.find(
            (g) => g.code === selectedPet.gender || g.name === selectedPet.gender,
          );
          const petGenderCode = petGenderItem?.code || selectedPet.gender || '';

          if (!selectedPet.patientTypeId || !selectedPet.breedId || !selectedPet.birthDate) {
            throw new Error('Не все данные нового питомца заполнены');
          }

          payload = {
            appointment: appointmentData,
            patient: {
              nickname: selectedPet.name,
              type_id: String(selectedPet.patientTypeId),
              breed_id: String(selectedPet.breedId),
              gender_id: getId(petGenderCode),
              birth_date: selectedPet.birthDate,
            },
            owner_id: ownerData.id,
          };
        } else if (isNewUser) {
          // Вариант для неавторизованного пользователя: используем полные данные
          // Находим gender_id для питомца из petGenders
          const petGenderItem = petGenders.find(
            (g) => g.code === petGender || g.name === petGender,
          );
          const petGenderId = petGenderItem?.code || petGender || '';

          if (!selectedPatientTypeId || !selectedBreedId || !petBirthDate) {
            throw new Error('Не все данные питомца заполнены');
          }

          payload = {
            appointment: appointmentData,
            patient: {
              nickname: petName,
              type_id: String(selectedPatientTypeId),
              breed_id: String(selectedBreedId),
              gender_id: getId(petGenderId),
              birth_date: petBirthDate.format('YYYY-MM-DD'),
            },
            owner: {
              name: firstName,
              surname: lastName,
              patronymic: patronymic,
              phone_number: phone.replace(/[^\d]/g, ''),
              gender: gender || Gender.MALE,
            },
          };
        } else {
          throw new Error('Недостаточно данных для создания записи');
        }

        await recordsApi.createRecord({
          apiUrl,
          payload,
        });
      } catch (e) {
        // Не блокируем UX: показываем подтверждение даже если запись не сохранилась.
        console.error('Ошибка создания записи:', e);
      }
    }

    if (selectedPetId) {
      selectPet(selectedPetId);
    }

    // Переход к экрану подтверждения
    goToAppointmentConfirmation(buildAppointmentDetailsDraft());
  };

  const handleAddNewPet = () => {
    setIsAddPetModalOpen(true);
  };

  const handleSaveNewPet = (pet: Omit<Pet, 'id'>) => {
    const newPet: Pet = {
      ...pet,
      id: -Date.now(),
      isLocal: true,
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

  const isOwnerRecognized = Boolean(ownerData && !isNewUser);
  const phoneValidationResult = validatePhoneUtil(phone);
  const phoneHasValidationError = hasAttemptedSubmit && !phoneValidationResult.isValid;
  const firstNameHasValidationError = hasAttemptedSubmit && isNewUser && !firstName.trim();
  const lastNameHasValidationError = hasAttemptedSubmit && isNewUser && !lastName.trim();
  const patronymicHasValidationError = hasAttemptedSubmit && isNewUser && !patronymic.trim();
  const genderHasValidationError = hasAttemptedSubmit && isNewUser && !gender;
  const selectedPetHasValidationError = hasAttemptedSubmit && !isNewUser && !selectedPetId;
  const petNameHasValidationError = hasAttemptedSubmit && isNewUser && !petName.trim();
  const patientTypeHasValidationError = hasAttemptedSubmit && isNewUser && !selectedPatientTypeId;
  const breedHasValidationError = hasAttemptedSubmit && isNewUser && !selectedBreedId;
  const petGenderHasValidationError = hasAttemptedSubmit && isNewUser && !petGender;
  const petBirthDateHasValidationError = hasAttemptedSubmit && isNewUser && !petBirthDate;
  const consentHasValidationError = hasAttemptedSubmit && !consentPersonalData;

  const buildAppointmentDetailsDraft = (): NonNullable<WidgetState['appointmentDetailsDraft']> => {
    const selectedPetData = pets.find((pet) => pet.id === selectedPetId);

    return {
      selectedPetId,
      selectedPatientTypeId,
      selectedBreedId,
      firstName,
      lastName,
      patronymic,
      gender,
      petName: isNewUser ? petName : selectedPetData?.name || '',
      petSpecies: isNewUser ? petSpecies : selectedPetData?.species || '',
      petBreed: isNewUser ? petBreed : selectedPetData?.breed || '',
      petGender,
      petBirthDate: petBirthDate?.format('YYYY-MM-DD') ?? null,
      symptoms,
      consentPersonalData,
      consentMarketing,
    };
  };

  return (
    <div className={`appointment-details ${isNewUser ? 'appointment-details--new-user' : ''}`}>
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
                <IconWrapper src={LocationIcon} size={48} withBackground={false} />
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
                <IconWrapper src={CalendarIcon} size={48} withBackground={false} />
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
                  status={phoneHasValidationError ? 'error' : undefined}
                  maxLength={32}
                  size='large'
                  autoFocus
                />
                {phoneError && <div className='appointment-details-phone-error'>{phoneError}</div>}
              </div>
            ) : (
              <div className='appointment-details-phone-display'>
                <div className='appointment-details-phone-display-content'>
                  <span className='appointment-details-phone-number'>{phone}</span>
                  {isOwnerRecognized && (
                    <span className='appointment-details-phone-check' aria-label='Номер подтвержден'>
                      <CheckOutlined />
                    </span>
                  )}

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
                  status={firstNameHasValidationError ? 'error' : undefined}
                  required
                />
                {firstNameHasValidationError && (
                  <div className='appointment-details-field-error'>Введите Имя</div>
                )}
              </div>
              <div className='appointment-details-field'>
                <CustomInput
                  text='Фамилия'
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  status={lastNameHasValidationError ? 'error' : undefined}
                  required
                />
                {lastNameHasValidationError && (
                  <div className='appointment-details-field-error'>Введите Фамилию</div>
                )}
              </div>
              <div className='appointment-details-field'>
                <CustomInput
                  text='Отчество'
                  value={patronymic}
                  onChange={(e) => setPatronymic(e.target.value)}
                  status={patronymicHasValidationError ? 'error' : undefined}
                  required
                />
                {patronymicHasValidationError && (
                  <div className='appointment-details-field-error'>Введите Отчество</div>
                )}
              </div>
              <div className='appointment-details-gender-section'>
                <Radio.Group
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={`appointment-details-gender-group gw-segmented ${
                    genderHasValidationError ? 'appointment-details-gender-group--error' : ''
                  }`}>
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
                    className={`appointment-details-pet-select ${
                      selectedPetHasValidationError ? 'appointment-details-pet-select--error' : ''
                    }`}
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
                  {selectedPetHasValidationError && (
                    <div className='appointment-details-field-error'>Выберите питомца</div>
                  )}
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
                  status={petNameHasValidationError ? 'error' : undefined}
                  required
                />
                {petNameHasValidationError && (
                  <div className='appointment-details-field-error'>Введите Кличку</div>
                )}
              </div>
              <div className='appointment-details-field'>
                {loadingBreeds ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                    <Spin />
                  </div>
                ) : (
                  <CustomSelector
                    text='Вид'
                    value={selectedPatientTypeId}
                    status={patientTypeHasValidationError ? 'error' : undefined}
                    onChange={(value) => {
                      if (value) {
                        selectPatientType(value);
                        setSelectedPatientTypeId(value);
                        // Сбрасываем породу при смене типа
                        setSelectedBreedId(undefined);
                        setPetBreed('');
                      }
                    }}
                    options={patientTypes.map((type) => ({
                      value: type.id,
                      label: type.name,
                    }))}
                    suffixIcon={<DownOutlined />}
                    disabled={patientTypes.length === 0}
                  />
                )}
                {patientTypeHasValidationError && (
                  <div className='appointment-details-field-error'>Выберите вид</div>
                )}
              </div>

              <div className='appointment-details-field'>
                <CustomSelector
                  text='Порода'
                  value={selectedBreedId}
                  status={breedHasValidationError ? 'error' : undefined}
                  onChange={(value) => {
                    if (value) {
                      selectBreed(value);
                      setSelectedBreedId(value);
                      // Сохраняем название породы для обратной совместимости
                      const breed = availableBreeds.find((b) => b.id === value);
                      if (breed) {
                        setPetBreed(breed.name);
                      }
                    }
                  }}
                  suffixIcon={<DownOutlined />}
                  options={availableBreeds.map((breed) => ({
                    value: breed.id,
                    label: breed.name,
                  }))}
                  disabled={!selectedPatientTypeId || availableBreeds.length === 0}
                />
                {breedHasValidationError && (
                  <div className='appointment-details-field-error'>Выберите породу</div>
                )}
              </div>
              <div className='appointment-details-gender-section'>
                <Radio.Group
                  value={petGender}
                  onChange={(e) => setPetGender(e.target.value)}
                  className={`appointment-details-gender-group gw-segmented ${
                    petGenderHasValidationError ? 'appointment-details-gender-group--error' : ''
                  }`}>
                  <Radio.Button value={Gender.FEMALE}>Женский</Radio.Button>
                  <Radio.Button value={Gender.MALE}>Мужской</Radio.Button>
                </Radio.Group>
              </div>
              <div className='appointment-details-field'>
                <CustomDatepicker
                  text='Дата рождения'
                  value={petBirthDate}
                  status={petBirthDateHasValidationError ? 'error' : undefined}
                  onChange={(date) => {
                    setPetBirthDate(date && date.isAfter(maxBirthDate) ? null : date);
                  }}
                  disabledDate={(current) => Boolean(current && current.isAfter(maxBirthDate))}
                  format='DD.MM.YYYY'
                  style={{ width: '100%' }}
                />
                {petBirthDateHasValidationError && (
                  <div className='appointment-details-field-error'>Выберите дату рождения</div>
                )}
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
              className={`appointment-details-consent-checkbox ${
                consentHasValidationError ? 'appointment-details-consent-checkbox--error' : ''
              }`}>
              Согласен на{' '}
              <a
                href={
                  widgetState.config?.isExternalLinkPolicy
                    ? widgetState.config?.linkToExternalPolicy
                    : '#'
                }
                className='appointment-details-consent-link'
                onClick={(e) => {
                  if (!widgetState.config?.isExternalLinkPolicy) {
                    e.preventDefault();
                    saveAppointmentDetailsDraft(buildAppointmentDetailsDraft());
                    goToPrivacyPolicy();
                  }
                }}
                target={widgetState.config?.isExternalLinkPolicy ? '_blank' : undefined}
                rel={widgetState.config?.isExternalLinkPolicy ? 'noopener noreferrer' : undefined}>
                обработку персональных данных
              </a>
            </Checkbox>
            {consentHasValidationError && (
              <div className='appointment-details-consent-required'>Обязательное поле</div>
            )}

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
              className='appointment-details-submit-btn gw-primary-btn'
              block
              onClick={handleSubmit}>
              Записаться
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
