import { Button, DatePicker, Modal, Radio, message } from 'antd';
import { Dayjs } from 'dayjs';
import React, { useEffect, useState } from 'react';
import {
  Gender,
  PET_SPECIES_OPTIONS,
  PetSpecies,
} from '../../../shared/constants';
import { usePetGenders } from '../../../shared/hooks/usePetGenders';
import CustomInput from '../../../shared/ui/CustomInput';
import CustomSelector from '../../../shared/ui/CustomSelector';
import { Pet } from '../../../types';
import './AddPetModal.css';

export interface AddPetModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (pet: Omit<Pet, 'id'>) => void;
}

export const AddPetModal: React.FC<AddPetModalProps> = ({ open, onClose, onSave }) => {
  const { genders: petGenders } = usePetGenders();
  const [name, setName] = useState<string>('');
  const [species, setSpecies] = useState<PetSpecies | string>('');
  const [breed, setBreed] = useState<string>('');
  const [gender, setGender] = useState<string>(Gender.MALE);
  const [birthDate, setBirthDate] = useState<Dayjs | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Инициализируем gender первым элементом из petGenders, когда они загрузятся
  useEffect(() => {
    if (petGenders.length > 0 && !petGenders.find((g) => g.code === gender)) {
      setGender(petGenders[0].code);
    }
  }, [petGenders, gender]);

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

    const pet: Omit<Pet, 'id'> = {
      name: name.trim(),
      species: species as string,
      breed,
      gender: gender as Gender,
      birthDate: birthDate?.format('YYYY-MM-DD'),
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
    setSpecies('');
    setBreed('');
    setGender(petGenders[0]?.code || Gender.MALE);
    setBirthDate(null);
    setErrors({});
    onClose();
  };

  // Временные данные для пород (заглушка)
  const breedOptions = species
    ? [
      { value: 'labrador', label: 'Лабрадор' },
      { value: 'german-shepherd', label: 'Немецкая овчарка' },
      { value: 'british', label: 'Британская' },
      { value: 'persian', label: 'Персидская' },
    ]
    : [];

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
              setSpecies(value);
              setBreed('');
              if (errors.species) {
                setErrors({ ...errors, species: '' });
              }
            }}
            options={PET_SPECIES_OPTIONS}
          />
          {errors.species && <div className='add-pet-modal-error'>{errors.species}</div>}
        </div>

        <div className='add-pet-modal-field'>
          <CustomSelector
            className={errors.breed ? 'error' : ''}
            text='Порода'
            value={breed}
            onChange={(value) => {
              setBreed(value);
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
            className='appointment-details-gender-group'>
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
              setBirthDate(date);
              if (errors.birthDate) {
                setErrors({ ...errors, birthDate: '' });
              }
            }}
            format='DD.MM.YYYY'
            style={{ width: '100%' }}
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
