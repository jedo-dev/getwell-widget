import React from 'react';
import { LeftOutlined, UserOutlined } from '@ant-design/icons';
import { Employee } from '../types';
import { goBack } from '../lib/widget-manager';
import './DoctorInfo.css';

export interface DoctorInfoProps {
  employee: Employee | null;
}

const DoctorInfo: React.FC<DoctorInfoProps> = ({ employee }) => {
  const handleBack = () => {
    goBack();
  };

  if (!employee) {
    return (
      <div className="doctor-info">
        <div className="doctor-info-header">
          <LeftOutlined className="doctor-info-back" onClick={handleBack} />
          <h2 className="doctor-info-title">Информация</h2>
        </div>
        <div className="doctor-info-content">
          <p>Врач не выбран</p>
        </div>
      </div>
    );
  }

  const fullName = `${employee.lastName} ${employee.firstName} ${employee.patronymic || ''}`.trim();

  // Стандартная информация о враче, если не указана
  const defaultInfo = 'Стремимся обеспечивать высокий уровень профессиональной ветеринарной помощи. От диагностики и лечения до медицинского сопровождения домашних питомцев разного вида, веса и возраста.';
  const doctorInfo = employee.information || defaultInfo;

  return (
    <div className="doctor-info">
      <div className="doctor-info-header">
        <LeftOutlined className="doctor-info-back" onClick={handleBack} />
        <h2 className="doctor-info-title">Информация</h2>
      </div>

      <div className="doctor-info-content">
        <div className="doctor-info-card">
          <div className="doctor-info-avatar">
            {employee.photo ? (
              <img src={employee.photo} alt={fullName} />
            ) : (
              <UserOutlined />
            )}
          </div>

          <div className="doctor-info-name">{fullName}</div>
          <div className="doctor-info-specialization">{employee.specialization}</div>

          <div className="doctor-info-section">
            <h3 className="doctor-info-section-title">О враче</h3>
            <div className="doctor-info-text">
              {doctorInfo.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorInfo;

