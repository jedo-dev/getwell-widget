import { RightOutlined } from '@ant-design/icons';
import { Input, List, Segmented, Tabs } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import SearchIcon from '../../../img/search.svg';
import {
  getWidgetState,
  goToDateTimeSelection,
  goToDepartmentSelection,
  goToDoctorInfo,
  goToPhoneInput,
  goToSpecialistSelection,
  selectDateTime,
  selectDepartment,
  selectDepartmentOnly,
  selectEmployee,
  setReservedTimeslotHash,
} from '../../../lib/widget-manager';
import {
  AvailableDoctorsData,
  AvailableTimechip,
  schedulesApi,
} from '../../../shared/api/schedules';
import { SELECTION_MODE_LABELS, WidgetStep } from '../../../shared/constants';
import { useTimechips } from '../../../shared/hooks/useTimechips';
import {
  findNearestTimeslot,
  formatEmployeeFullName,
  formatNearestAppointmentDate,
  localDateTimeToIso,
} from '../../../shared/lib';
import { ActionFooter, DoctorSelectionList, EmptyState, Notification } from '../../../shared/ui';
import { Department, Employee, SelectionMode } from '../../../types';
import './SpecialistSelection.css';

export interface SpecialistSelectionProps {
  employees: Employee[];
  departments: Department[];
  selectedEmployeeId: number | null;
  selectedDepartmentId: number | null;
  selectionMode?: SelectionMode;
  doctorsWithSchedules?: AvailableDoctorsData[];
}

export const SpecialistSelection: React.FC<SpecialistSelectionProps> = ({
  employees,
  departments,
  selectedEmployeeId,
  selectedDepartmentId,
  selectionMode = SelectionMode.EMPLOYEE,
  doctorsWithSchedules = [],
}) => {
  const widgetState = getWidgetState();
  const showDepartments = widgetState.config?.showDepartments ?? true;
  const showDoctorInfo = widgetState.config?.showDoctorInfo ?? true;
  const showEmployeePosition = widgetState.config?.showEmployeePosition ?? true;
  const selectedFilial = widgetState.selectedBranchId;
  const selectedBranchTimezone =
    widgetState.config?.branches?.find((branch) => branch.id === selectedFilial)?.timezone ?? null;
  const [activeTab, setActiveTab] = useState<string>(
    selectionMode === SelectionMode.DEPARTMENT && showDepartments ? 'department' : 'name',
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string } | null>(null);
  const [selectedTimechipKey, setSelectedTimechipKey] = useState<string | null>(null);

  useEffect(() => {
    if (selectionMode === SelectionMode.DEPARTMENT && showDepartments) {
      setActiveTab('department');
    } else {
      setActiveTab('name');
      if (selectionMode === SelectionMode.DEPARTMENT && !showDepartments) {
        goToSpecialistSelection();
      }
    }
  }, [selectionMode, showDepartments]);

  useEffect(() => {
    setSelectedTimechipKey(null);
  }, [selectedEmployeeId]);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) {
      return employees;
    }

    const query = searchQuery.toLowerCase();
    return employees.filter((emp) => {
      const fullName = formatEmployeeFullName(emp).toLowerCase();
      const specialization = emp.specialization.toLowerCase();
      return fullName.includes(query) || specialization.includes(query);
    });
  }, [employees, searchQuery]);

  const filteredDepartments = useMemo(() => {
    let deps = departments;
    if (selectedFilial) {
      deps = departments.filter((department) => department.filialId === selectedFilial);
    }
    if (!searchQuery.trim()) {
      return deps;
    }

    const query = searchQuery.toLowerCase();
    return deps.filter((dept) => {
      return dept.name.toLowerCase().includes(query);
    });
  }, [departments, searchQuery]);

  const handleEmployeeSelect = (employeeId: number) => {
    selectEmployee(employeeId);
  };

  const handleDepartmentSelect = (departmentId: number) => {
    selectDepartment(departmentId);
  };

  const handleSelectDateTime = () => {
    goToDateTimeSelection();
  };

  const handleContinueToPhoneInput = () => {
    goToPhoneInput();
  };

  const handleDoctorInfo = () => {
    goToDoctorInfo();
  };

  const selectedEmployee = selectedEmployeeId
    ? employees.find((emp) => emp.id === selectedEmployeeId)
    : null;

  const selectedEmployeeData = selectedEmployeeId
    ? doctorsWithSchedules.find((d) => d.employee.id === selectedEmployeeId)
    : undefined;
  const nearestTimeslot = findNearestTimeslot(selectedEmployeeData);
  const nearestAppointmentDate = formatNearestAppointmentDate(nearestTimeslot?.from || null);

  const isOnSpecialistSelectionStep = widgetState.currentStep === WidgetStep.SPECIALIST_SELECTION;
  const {
    timechips,
    loading: loadingTimechips,
    error: timechipsError,
  } = useTimechips(
    selectedEmployeeId,
    isOnSpecialistSelectionStep && selectionMode === SelectionMode.EMPLOYEE,
    nearestAppointmentDate.date,
    { includeDepartmentFilter: false },
  );

  const handleTimeChipClick = async (timechip: AvailableTimechip) => {
    if (!selectedEmployeeId) return;

    if (timechip.department_id) {
      selectDepartmentOnly(timechip.department_id);
    }

    const latestState = getWidgetState();
    const departmentIdForReservation =
      timechip.department_id ??
      latestState.selectedDepartmentId ??
      selectedDepartmentId ??
      undefined;

    const fromIso = localDateTimeToIso(timechip.from);
    const toIso = localDateTimeToIso(timechip.to);
    selectDateTime(fromIso, toIso, timechip.from, timechip.to);

    if (latestState.config?.apiUrl && departmentIdForReservation) {
      try {
        const result = await schedulesApi.reserveTimeslot({
          apiUrl: latestState.config.apiUrl,
          timeslot: {
            from: timechip.from,
            to: timechip.to,
          },
          departmentId: departmentIdForReservation,
          employeeId: selectedEmployeeId,
          uniqueHash: latestState.reservedTimeslotHash || undefined,
        });

        if (result.unique_hash) {
          setReservedTimeslotHash(result.unique_hash);
        }
      } catch (error: any) {
        console.error('Error reserving slot:', error);
        if (error.code === 'DUPLICATE_ENTRY' || error.message === 'duplicate_entry') {
          setNotification({ message: 'Время уже занято. Пожалуйста, выберите другое время.' });
          return;
        }
        return;
      }
    }

    setSelectedTimechipKey(`${timechip.from}_${timechip.to}`);
  };

  const options = [
    { label: SELECTION_MODE_LABELS[SelectionMode.EMPLOYEE], value: 'name' },
    ...(showDepartments
      ? [{ label: SELECTION_MODE_LABELS[SelectionMode.DEPARTMENT], value: 'department' }]
      : []),
  ];

  return (
    <div className='specialist-selection'>
      {notification && (
        <Notification
          message={notification.message}
          type='error'
          duration={5000}
          onClose={() => setNotification(null)}
        />
      )}

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        renderTabBar={() =>
          options.length > 1 ? (
            <Segmented
              options={options}
              value={activeTab}
              className='branch-selection-tabs-segmented'
              onChange={(value) => {
                setActiveTab(value as string);
                if (value === 'department') {
                  goToDepartmentSelection();
                } else {
                  goToSpecialistSelection();
                }
              }}
            />
          ) : (
            <></>
          )
        }
        defaultValue={
          selectionMode === SelectionMode.DEPARTMENT && showDepartments ? 'department' : 'name'
        }
        className='specialist-selection-tabs'
        items={[
          {
            key: 'name',
            label: SELECTION_MODE_LABELS[SelectionMode.EMPLOYEE],
            children: (
              <div className='specialist-selection-content'>
                <DoctorSelectionList
                  baseClass='specialist-selection'
                  employees={filteredEmployees}
                  doctorsWithSchedules={doctorsWithSchedules}
                  selectedEmployeeId={selectedEmployeeId}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onEmployeeSelect={handleEmployeeSelect}
                  showEmployeePosition={showEmployeePosition}
                  loadingTimechips={loadingTimechips}
                  timechips={timechips}
                  timechipsError={timechipsError}
                  selectedTimechipKey={selectedTimechipKey}
                  onTimechipClick={handleTimeChipClick}
                  onSelectDateTime={handleSelectDateTime}
                  selectedBranchTimezone={selectedBranchTimezone}
                />
              </div>
            ),
          },
          ...(showDepartments
            ? [
                {
                  key: 'department',
                  label: SELECTION_MODE_LABELS[SelectionMode.DEPARTMENT],
                  children: (
                    <>
                      <Input
                        placeholder='Поиск'
                        prefix={
                          <img
                            src={SearchIcon}
                            alt=''
                            aria-hidden='true'
                            className='specialist-selection-search-icon'
                          />
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='specialist-selection-search'
                      />

                      {filteredDepartments.length > 0 ? (
                        <List
                          className='specialist-selection-list'
                          dataSource={filteredDepartments}
                          renderItem={(department) => {
                            const isSelected = selectedDepartmentId === department.id;

                            return (
                              <List.Item
                                className={`specialist-selection-item ${
                                  isSelected ? 'selected' : ''
                                }`}
                                onClick={() => handleDepartmentSelect(department.id)}>
                                <div className='specialist-selection-item-content'>
                                  <div className='specialist-selection-item-left'>
                                    <div className='specialist-selection-item-info'>
                                      <div className='specialist-selection-item-name'>
                                        {department.name}
                                      </div>
                                    </div>
                                  </div>
                                  <RightOutlined className='specialist-selection-item-arrow' />
                                </div>
                              </List.Item>
                            );
                          }}
                        />
                      ) : (
                        <EmptyState description='Отделения не найдены' />
                      )}
                    </>
                  ),
                },
              ]
            : []),
        ]}
      />

      {selectedEmployee && selectionMode === SelectionMode.EMPLOYEE && (
        <ActionFooter
          className='specialist-selection-footer'
          showSecondary={showDoctorInfo}
          secondaryLabel='О враче'
          onSecondaryClick={handleDoctorInfo}
          primaryLabel={selectedTimechipKey ? 'Далее' : 'Выбрать дату и время'}
          onPrimaryClick={selectedTimechipKey ? handleContinueToPhoneInput : handleSelectDateTime}
        />
      )}
    </div>
  );
};
