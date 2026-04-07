import { Button, Input, List, Radio, Skeleton, Tag } from 'antd';
import React from 'react';
import SearchIcon from '../../../img/search.svg';
import { AvailableDoctorsData, AvailableTimechip } from '../../api/schedules';
import {
  findNearestTimeslot,
  formatEmployeeFullName,
  formatNearestAppointmentDate,
  formatTimeFromDateTime,
} from '../../lib';
import { Employee } from '../../../types';
import { Avatar, EmptyState } from '..';

interface DoctorSelectionListProps {
  baseClass: string;
  employees: Employee[];
  doctorsWithSchedules: AvailableDoctorsData[];
  selectedEmployeeId: number | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onEmployeeSelect: (employeeId: number) => void;
  showEmployeePosition: boolean;
  loadingTimechips: boolean;
  timechips: AvailableTimechip[];
  timechipsError: string | null;
  selectedTimechipKey: string | null;
  onTimechipClick: (timechip: AvailableTimechip) => void;
  onSelectDateTime: () => void;
  emptyDescription?: string;
}

const MAX_VISIBLE_SLOTS = 10;

export const DoctorSelectionList: React.FC<DoctorSelectionListProps> = ({
  baseClass,
  employees,
  doctorsWithSchedules,
  selectedEmployeeId,
  searchQuery,
  onSearchChange,
  onEmployeeSelect,
  showEmployeePosition,
  loadingTimechips,
  timechips,
  timechipsError,
  selectedTimechipKey,
  onTimechipClick,
  onSelectDateTime,
  emptyDescription = 'Специалисты не найдены',
}) => {
  const visibleTimechips = timechips.slice(0, MAX_VISIBLE_SLOTS);
  const hasTimechips = visibleTimechips.length > 0;

  return (
    <>
      <Input
        placeholder='Поиск'
        prefix={
          <img src={SearchIcon} alt='' aria-hidden='true' className={`${baseClass}-search-icon`} />
        }
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className={`${baseClass}-search`}
      />

      {employees.length > 0 ? (
        <List
          className={`${baseClass}-list`}
          dataSource={employees}
          renderItem={(employee) => {
            const isSelected = selectedEmployeeId === employee.id;
            const fullName = formatEmployeeFullName(employee);
            const isCurrentEmployee = isSelected && employee.id === selectedEmployeeId;
            const doctorData = doctorsWithSchedules.find((d) => d.employee.id === employee.id);
            const nearestTimeslot = findNearestTimeslot(doctorData);
            const appointmentDate = formatNearestAppointmentDate(nearestTimeslot?.from || null);
            const hasAppointment = !!appointmentDate.date;

            return (
              <List.Item
                className={`${baseClass}-item ${isSelected ? 'selected' : ''} ${
                  !hasAppointment ? 'disabled' : ''
                }`}
                onClick={() => {
                  if (hasAppointment) {
                    onEmployeeSelect(employee.id);
                  }
                }}>
                <div className={`${baseClass}-item-content`}>
                  <div className={`${baseClass}-item-content-left`}>
                    <div className={`${baseClass}-item-left`}>
                      <Avatar
                        src={employee.photo}
                        alt={fullName}
                        size='medium'
                        className={`${baseClass}-avatar`}
                      />
                      <div className={`${baseClass}-item-info`}>
                        <div className={`${baseClass}-item-name`}>{fullName}</div>
                        {showEmployeePosition && (
                          <div className={`${baseClass}-item-specialization`}>
                            {employee.specialization}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`${baseClass}-item-appointment`}>
                      Ближайшее время приёма: <Tag>{appointmentDate.text}</Tag>
                    </div>

                    {isCurrentEmployee && (
                      <>
                        {loadingTimechips && (
                          <div className={`${baseClass}-time-slots`}>
                            <Skeleton.Button active size='small' block={false} />
                            <Skeleton.Button active size='small' block={false} />
                            <Skeleton.Button active size='small' block={false} />
                          </div>
                        )}

                        {!loadingTimechips && hasTimechips && (
                          <div className={`${baseClass}-time-slots`}>
                            {visibleTimechips.map((timechip, index) => {
                              const timeStr = formatTimeFromDateTime(timechip.from);
                              const isDisabled = timechip.is_limited;
                              return (
                                <button
                                  key={`${timechip.from}-${index}`}
                                  className={`${baseClass}-time-slot ${
                                    selectedTimechipKey === `${timechip.from}_${timechip.to}`
                                      ? 'selected'
                                      : ''
                                  } ${isDisabled ? 'disabled' : ''}`}
                                  type='button'
                                  disabled={isDisabled}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isDisabled) {
                                      onTimechipClick(timechip);
                                    }
                                  }}>
                                  {timeStr}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {!loadingTimechips && !hasTimechips && !timechipsError && (
                          <div className={`${baseClass}-no-slots`}>
                            <div className={`${baseClass}-no-slots-text`}>Нет слотов на сегодня</div>
                            <Button
                              type='link'
                              className={`${baseClass}-select-date-btn`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectDateTime();
                              }}>
                              Выбрать дату и время
                            </Button>
                          </div>
                        )}

                        {!loadingTimechips && timechipsError && (
                          <div className={`${baseClass}-no-slots`}>
                            <Button
                              type='link'
                              className={`${baseClass}-select-date-btn`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectDateTime();
                              }}>
                              Выбрать дату и время
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <Radio checked={isSelected} />
                </div>
              </List.Item>
            );
          }}
        />
      ) : (
        <EmptyState description={emptyDescription} />
      )}
    </>
  );
};
