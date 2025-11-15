import React, { useState } from 'react';
import { Modal, Input, Select, DatePicker, Button, Radio, message } from 'antd';
import { Dayjs } from 'dayjs';
import { Pet } from '../types';
import './AddPetModal.css';

export interface AddPetModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (pet: Omit<Pet, 'id'>) => void;
}

const AddPetModal: React.FC<AddPetModalProps> = ({ open, onClose, onSave }) => {
  const [name, setName] = useState<string>('');
  const [species, setSpecies] = useState<string>('');
  const [breed, setBreed] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthDate, setBirthDate] = useState<Dayjs | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      species,
      breed,
      age: birthDate ? Math.floor((Date.now() - birthDate.valueOf()) / (1000 * 60 * 60 * 24 * 365)) : undefined,
    };

    onSave(pet);
    handleClose();
    message.success('Питомец успешно добавлен');
  };

  const handleClose = () => {
    setName('');
    setSpecies('');
    setBreed('');
    setGender('male');
    setBirthDate(null);
    setErrors({});
    onClose();
  };

  // Временные данные для видов и пород (заглушка)
  const speciesOptions = [
    { value: 'dog', label: 'Собака' },
    { value: 'cat', label: 'Кошка' },
    { value: 'bird', label: 'Птица' },
    { value: 'rodent', label: 'Грызун' },
    { value: 'other', label: 'Другое' },
  ];

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
      title="Новый питомец"
      open={open}
      onCancel={handleClose}
      footer={null}
      className="add-pet-modal"
      closeIcon={<span className="add-pet-modal-close">×</span>}
      getContainer={false}
      style={{ top: 'auto', bottom: 0, paddingBottom: 0 }}
      wrapClassName="add-pet-modal-wrap"
    >
      <div className="add-pet-modal-content">
        <div className="add-pet-modal-field">
          <label className="add-pet-modal-label">
            Кличка <span className="add-pet-modal-required">*</span>
          </label>
          <Input
            className={errors.name ? 'error' : ''}
            placeholder="Введите кличку"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) {
                setErrors({ ...errors, name: '' });
              }
            }}
          />
          {errors.name && (
            <div className="add-pet-modal-error">{errors.name}</div>
          )}
        </div>

        <div className="add-pet-modal-field">
          <label className="add-pet-modal-label">
            Вид <span className="add-pet-modal-required">*</span>
          </label>
          <Select
            className={errors.species ? 'error' : ''}
            placeholder="Выберите вид"
            value={species}
            onChange={(value) => {
              setSpecies(value);
              setBreed('');
              if (errors.species) {
                setErrors({ ...errors, species: '' });
              }
            }}
            options={speciesOptions}
          />
          {errors.species && (
            <div className="add-pet-modal-error">{errors.species}</div>
          )}
        </div>

        <div className="add-pet-modal-field">
          <label className="add-pet-modal-label">
            Порода <span className="add-pet-modal-required">*</span>
          </label>
          <Select
            className={errors.breed ? 'error' : ''}
            placeholder="Выберите породу"
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
          {errors.breed && (
            <div className="add-pet-modal-error">{errors.breed}</div>
          )}
        </div>

        <div className="add-pet-modal-field">
          <label className="add-pet-modal-label">Пол</label>
          <Radio.Group
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="add-pet-modal-gender"
          >
            <Radio.Button value="male">Самец</Radio.Button>
            <Radio.Button value="female">Самка</Radio.Button>
          </Radio.Group>
        </div>

        <div className="add-pet-modal-field">
          <label className="add-pet-modal-label">
            Дата рождения <span className="add-pet-modal-required">*</span>
          </label>
          <DatePicker
            className={`add-pet-modal-datepicker ${errors.birthDate ? 'error' : ''}`}
            placeholder="Выберите дату"
            value={birthDate}
            onChange={(date) => {
              setBirthDate(date);
              if (errors.birthDate) {
                setErrors({ ...errors, birthDate: '' });
              }
            }}
            format="DD.MM.YYYY"
            style={{ width: '100%' }}
          />
          {errors.birthDate && (
            <div className="add-pet-modal-error">{errors.birthDate}</div>
          )}
        </div>
      </div>

      <div className="add-pet-modal-footer">
        <Button
          type="primary"
          className="add-pet-modal-save-btn"
          block
          onClick={handleSave}
        >
          Сохранить
        </Button>
      </div>
    </Modal>
  );
};

export default AddPetModal;

