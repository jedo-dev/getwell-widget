import { Button, DatePicker, Modal, Radio, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { getWidgetState } from '../../../lib/widget-manager';
import { patientsApi } from '../../../shared/api';
import { Gender } from '../../../shared/constants';
import { usePetGenders } from '../../../shared/hooks/usePetGenders';
import CustomInput from '../../../shared/ui/CustomInput';
import CustomSelector from '../../../shared/ui/CustomSelector';
import { Breed, Pet } from '../../../types';
import './AddPetModal.css';

export interface AddPetModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (pet: Omit<Pet, 'id'>) => void;
}

export const AddPetModal: React.FC<AddPetModalProps> = ({ open, onClose, onSave }) => {
  const maxBirthDate = dayjs().endOf('day');
  const { genders: petGenders } = usePetGenders();
  const widgetState = getWidgetState();
  const [name, setName] = useState<string>('');
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [species, setSpecies] = useState<number | null>(null);
  const [breed, setBreed] = useState<number | null>(null);
  const [gender, setGender] = useState<string>('');
  const [birthDate, setBirthDate] = useState<Dayjs | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Инициализируем gender первым элементом из petGenders, когда они загрузятся
  useEffect(() => {
    if (petGenders.length > 0 && !petGenders.find((g) => g.code === gender)) {
      setGender(petGenders[0].code);
    }
  }, [petGenders, gender]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const config = widgetState.config;
    if (!config?.apiUrl || config.offlineMode) {
      setBreeds([]);
      return;
    }

    const loadBreeds = async () => {
      try {
        const breedsData = await patientsApi.getBreeds(config.apiUrl);
        setBreeds(breedsData);
      } catch (error) {
        console.error('Ошибка загрузки пород для модалки питомца:', error);
        setBreeds([]);
      }
    };

    loadBreeds();
  }, [open, widgetState.config]);

  const speciesOptions = useMemo(() => {
    const typeMap = new Map<number, string>();
    breeds.forEach((item) => {
      typeMap.set(item.patient_type.id, item.patient_type.name);
    });

    return Array.from(typeMap.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [breeds]);

  const breedOptions = useMemo(() => {
    if (!species) {
      return [];
    }

    return breeds
      .filter((item) => item.patient_type.id === species)
      .map((item) => ({
        value: item.id,
        label: item.name,
      }));
  }, [breeds, species]);

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Введите кличку питомца';
    }

    if (!species) {
      newErrors.species = 'Выберите вид животного';
    }

    if (!breed) {
      newErrors.breed = 'Выберите породу';
    }

    if (!birthDate) {
      newErrors.birthDate = 'Выберите дату рождения';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedSpecies = breeds.find((item) => item.patient_type.id === species)?.patient_type.name;
    const selectedBreed = breeds.find((item) => item.id === breed)?.name;

    const pet: Omit<Pet, 'id'> = {
      name: name.trim(),
      species: selectedSpecies || '',
      breed: selectedBreed || '',
      patientTypeId: species || undefined,
      breedId: breed || undefined,
      gender: gender as Gender,
      birthDate: birthDate?.format('YYYY-MM-DD'),
      isLocal: true,
      age: birthDate
        ? Math.floor((Date.now() - birthDate.valueOf()) / (1000 * 60 * 60 * 24 * 365))
        : undefined,
    };

    onSave(pet);
    handleClose();
    message.success('Питомец успешно добавлен');
  };

  const handleClose = () => {
    setName('');
    setSpecies(null);
    setBreed(null);
    setGender(petGenders[0]?.code || Gender.MALE);
    setBirthDate(null);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      title='Новый питомец'
      open={open}
      centered={false}
      onCancel={handleClose}
      footer={null}
      className='add-pet-modal'
      closeIcon={<span className='add-pet-modal-close'>×</span>}
      getContainer={false}
      style={{ top: 'auto', bottom: 0, paddingBottom: 0, right: 0 }}
      wrapClassName='add-pet-modal-wrap'>
      <div className='add-pet-modal-content'>
        <div className='add-pet-modal-field'>
          <CustomInput
            className={errors.name ? 'error' : ''}
            text='Кличка'
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) {
                setErrors({ ...errors, name: '' });
              }
            }}
          />
          {errors.name && <div className='add-pet-modal-error'>{errors.name}</div>}
        </div>

        <div className='add-pet-modal-field'>
          <CustomSelector
            className={errors.species ? 'error' : ''}
            text='Вид'
            value={species}
            onChange={(value) => {
              setSpecies(typeof value === 'number' ? value : Number(value));
              setBreed(null);
              if (errors.species) {
                setErrors({ ...errors, species: '' });
              }
            }}
            options={speciesOptions}
          />
          {errors.species && <div className='add-pet-modal-error'>{errors.species}</div>}
        </div>

        <div className='add-pet-modal-field'>
          <CustomSelector
            className={errors.breed ? 'error' : ''}
            text='Порода'
            value={breed}
            onChange={(value) => {
              setBreed(typeof value === 'number' ? value : Number(value));
              if (errors.breed) {
                setErrors({ ...errors, breed: '' });
              }
            }}
            options={breedOptions}
            disabled={!species}
          />
          {errors.breed && <div className='add-pet-modal-error'>{errors.breed}</div>}
        </div>

        <div className='add-pet-modal-field'>
          <label className='add-pet-modal-label'>Пол</label>
          <Radio.Group
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className='add-pet-modal-gender'>
            {petGenders.map((g) => (
              <Radio.Button key={g.code} value={g.code}>
                {g.name}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>

        <div className='add-pet-modal-field'>
          <label className='add-pet-modal-label'>
            Дата рождения <span className='add-pet-modal-required'>*</span>
          </label>
          <DatePicker
            className={`add-pet-modal-datepicker ${errors.birthDate ? 'error' : ''}`}
            placeholder='Выберите дату'
            value={birthDate}
            onChange={(date) => {
              setBirthDate(date && date.isAfter(maxBirthDate) ? null : date);
              if (errors.birthDate) {
                setErrors({ ...errors, birthDate: '' });
              }
            }}
            disabledDate={(current) => Boolean(current && current.isAfter(maxBirthDate))}
            format='DD.MM.YYYY'
            style={{ width: '100%' }}
            inputReadOnly
          />
          {errors.birthDate && <div className='add-pet-modal-error'>{errors.birthDate}</div>}
        </div>
      </div>

      <div className='add-pet-modal-footer'>
        <Button type='primary' className='add-pet-modal-save-btn' block onClick={handleSave}>
          Сохранить
        </Button>
      </div>
    </Modal>
  );
};
