import { Radio, Tag } from 'antd';
import React from 'react';

import { Employee } from '../../../types';
import { formatEmployeeFullName } from '../../lib';
import { Avatar } from '../Avatar/Avatar';

export type EmployeeListItemClassPrefix =
  | 'specialist-selection'
  | 'department-specialists-selection';

export interface EmployeeListItemProps {
  /** CSS class prefix used by existing step styles */
  prefix: EmployeeListItemClassPrefix;
  employee: Employee;
  isSelected: boolean;
  showEmployeePosition: boolean;
  nearestAppointmentLabel: string;
  timeSlots?: string[];
  onSelect: (employeeId: number) => void;
  onClickTimeSlot?: (slot: string) => void;
}

export const EmployeeListItem: React.FC<EmployeeListItemProps> = ({
  prefix,
  employee,
  isSelected,
  showEmployeePosition,
  nearestAppointmentLabel,
  timeSlots = [],
  onSelect,
  onClickTimeSlot,
}) => {
  const fullName = formatEmployeeFullName(employee);

  return (
    <div
      className={`${prefix}-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(employee.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect(employee.id);
      }}
    >
      <div className={`${prefix}-item-content`}>
        <div className={`${prefix}-item-content-left`}>
          <div className={`${prefix}-item-left`}>
            <Avatar
              src={employee.photo}
              alt={fullName}
              size="medium"
              className={`${prefix}-avatar`}
            />
            <div className={`${prefix}-item-info`}>
              <div className={`${prefix}-item-name`}>{fullName}</div>
              {showEmployeePosition && (
                <div className={`${prefix}-item-specialization`}>
                  {employee.specialization}
                </div>
              )}
            </div>
          </div>

          <div className={`${prefix}-item-appointment`}>
            Ближайшее время приёма: <Tag>{nearestAppointmentLabel}</Tag>
          </div>

          {isSelected && timeSlots.length > 0 && (
            <div className={`${prefix}-time-slots`}>
              {timeSlots.map((slot, index) => (
                <button
                  key={`${slot}-${index}`}
                  className={`${prefix}-time-slot`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClickTimeSlot?.(slot);
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>

        <Radio checked={isSelected} />
      </div>
    </div>
  );
};
