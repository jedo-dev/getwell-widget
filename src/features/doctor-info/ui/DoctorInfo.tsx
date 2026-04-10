import React from 'react';
import { getWidgetState } from '../../../lib/widget-manager';
import { formatEmployeeFullName } from '../../../shared/lib';
import { Avatar } from '../../../shared/ui';
import { Employee } from '../../../types';
import './DoctorInfo.css';

export interface DoctorInfoProps {
  employee: Employee | null;
}

export const DoctorInfo: React.FC<DoctorInfoProps> = ({ employee }) => {
  const widgetState = getWidgetState();
  const showEmployeePosition = widgetState.config?.showEmployeePosition ?? true;

  if (!employee) {
    return (
      <div className='doctor-info'>
        <div className='doctor-info-content'>
          <p>Врач не выбран</p>
        </div>
      </div>
    );
  }

  const fullName = formatEmployeeFullName(employee);

  // Стандартная информация о враче, если не указана
  const defaultInfo = '';
  const doctorInfo = employee.information || defaultInfo;

  return (
    <div className='doctor-info'>
      <div className='doctor-info-content'>
        <div className='doctor-info-profile-card'>
          <div className='doctor-info-card-wallpaper'></div>
          <Avatar
            src={employee.photo}
            alt={fullName}
            size='xlarge'
            className='doctor-info-avatar'
          />

          <div className='doctor-info-name'>{fullName}</div>
          {showEmployeePosition && (
            <div className='doctor-info-specialization'>{employee.specialization}</div>
          )}
        </div>

        <div className='doctor-info-about-card'>
          <div className='doctor-info-section'>
            <h3 className='doctor-info-section-title'>
              {doctorInfo && <h3 className='doctor-info-section-title'>О враче</h3>}
            </h3>
            <div className='doctor-info-text'>
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
