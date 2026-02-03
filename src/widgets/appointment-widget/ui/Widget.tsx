import { CheckCircleOutlined, LeftOutlined } from '@ant-design/icons';
import { Drawer, Spin } from 'antd';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';

import { AppointmentConfirmation } from '../../../features/appointment-confirmation';
import { AppointmentDetails } from '../../../features/appointment-details';
import { BranchSelection } from '../../../features/branch-selection';
import { DateTimeSelection } from '../../../features/date-time-selection';
import { DepartmentSpecialistsSelection } from '../../../features/department-selection';
import { DoctorInfo } from '../../../features/doctor-info';
import { NextSteps } from '../../../features/next-steps';
import { PhoneInput } from '../../../features/phone-input';
import { PrivacyPolicy } from '../../../features/privacy-policy';
import { SpecialistSelection } from '../../../features/specialist-selection';
import defaultImage from '../../../img/default.png';
import { goBack } from '../../../lib/widget-manager';
import { branchesApi, departmentsApi, schedulesApi } from '../../../shared/api';
import { SelectionMode, WidgetStep } from '../../../shared/constants';
import { formatEmployeeFullName } from '../../../shared/lib';
import { Branch, Department, Employee, WidgetState } from '../../../types';
import './Widget.css';

export interface WidgetProps {
  open: boolean;
  onClose: () => void;
  widgetState: WidgetState;
  withoutDrawer?: boolean;
}

function useResponsiveDrawerWidth(defaultDesktopWidth: number) {
  const [drawerWidth, setDrawerWidth] = useState<number | string>(defaultDesktopWidth);

  useEffect(() => {
    const updateWidth = () => {
      setDrawerWidth(window.innerWidth <= 768 ? '100%' : defaultDesktopWidth);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, [defaultDesktopWidth]);

  return drawerWidth;
}

function isOfflineMode(state: WidgetState): boolean {
  const cfg = state.config;
  if (!cfg) return false;
  if (cfg.offlineMode === true) return true;

  const hasLocalData =
    (cfg.branches?.length ?? 0) > 0 || (cfg.employees?.length ?? 0) > 0 || (cfg.departments?.length ?? 0) > 0;

  return !cfg.apiUrl && hasLocalData;
}

export const Widget: React.FC<WidgetProps> = ({ open, onClose, widgetState, withoutDrawer = false }) => {
  const drawerWidth = useResponsiveDrawerWidth(600);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const offline = useMemo(() => isOfflineMode(widgetState), [widgetState]);

  // Load branches (once the widget is visible)
  useEffect(() => {
    if (!(open || withoutDrawer)) return;

    if ((widgetState.config?.branches?.length ?? 0) > 0) {
      setBranches(widgetState.config!.branches!);
      setLoadingBranches(false);
      return;
    }

    if (offline) {
      setBranches([]);
      setLoadingBranches(false);
      return;
    }

    if (!widgetState.config?.apiUrl) return;

    let isCancelled = false;
    const loadBranches = async () => {
      setLoadingBranches(true);
      try {
        const response = await branchesApi.getAll();
        if (!isCancelled && response.success && response.data) {
          setBranches(response.data);
        }
      } catch (error) {
        console.error('Ошибка загрузки филиалов:', error);
      } finally {
        if (!isCancelled) setLoadingBranches(false);
      }
    };

    loadBranches();
    return () => {
      isCancelled = true;
    };
  }, [open, withoutDrawer, offline, widgetState.config?.apiUrl, widgetState.config?.branches]);

  // Load departments when entering specialist-related steps
  useEffect(() => {
    if (!open) return;
    const isDeptRelevantStep =
      widgetState.currentStep === WidgetStep.SPECIALIST_SELECTION ||
      widgetState.currentStep === WidgetStep.DEPARTMENT_SPECIALISTS_SELECTION;

    if (!isDeptRelevantStep || !widgetState.selectedBranchId) return;

    if ((widgetState.config?.departments?.length ?? 0) > 0) {
      setDepartments(widgetState.config!.departments!);
      setLoadingDepartments(false);
      return;
    }

    if (offline) {
      setDepartments([]);
      setLoadingDepartments(false);
      return;
    }

    let isCancelled = false;
    const loadDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const response = await departmentsApi.getByBranch(widgetState.selectedBranchId!);
        if (!isCancelled && response.success && response.data) {
          setDepartments(response.data);
        }
      } catch (error) {
        console.error('Ошибка загрузки отделений:', error);
      } finally {
        if (!isCancelled) setLoadingDepartments(false);
      }
    };

    loadDepartments();
    return () => {
      isCancelled = true;
    };
  }, [open, offline, widgetState.currentStep, widgetState.selectedBranchId, widgetState.config?.departments]);

  // Load employees (available doctors) when entering relevant steps
  useEffect(() => {
    if (!open) return;

    const { currentStep, selectedBranchId, selectedDepartmentId } = widgetState;

    const isEmployeesStep =
      currentStep === WidgetStep.SPECIALIST_SELECTION ||
      currentStep === WidgetStep.DEPARTMENT_SPECIALISTS_SELECTION;

    if (!isEmployeesStep || !selectedBranchId) return;

    if ((widgetState.config?.employees?.length ?? 0) > 0) {
      setEmployees(widgetState.config!.employees!);
      setLoadingEmployees(false);
      return;
    }

    if (offline) {
      setEmployees([]);
      setLoadingEmployees(false);
      return;
    }

    if (!widgetState.config?.apiUrl) {
      setEmployees([]);
      setLoadingEmployees(false);
      return;
    }

    let isCancelled = false;
    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const doctors = await schedulesApi.getAvailableDoctors({
          apiUrl: widgetState.config!.apiUrl!,
          filialId: selectedBranchId!,
          departmentId:
            currentStep === WidgetStep.DEPARTMENT_SPECIALISTS_SELECTION ? selectedDepartmentId ?? undefined : undefined,
        });
        if (!isCancelled) setEmployees(doctors);
      } catch (error) {
        console.error('Ошибка загрузки доступных врачей:', error);
        if (!isCancelled) setEmployees([]);
      } finally {
        if (!isCancelled) setLoadingEmployees(false);
      }
    };

    loadEmployees();
    return () => {
      isCancelled = true;
    };
  }, [
    open,
    offline,
    widgetState.currentStep,
    widgetState.selectedBranchId,
    widgetState.selectedDepartmentId,
    widgetState.config?.employees,
    widgetState.config?.apiUrl,
  ]);

  const selectedBranch = useMemo(() => {
    if (!widgetState.selectedBranchId) return null;
    return branches.find((b) => b.id === widgetState.selectedBranchId) ?? null;
  }, [branches, widgetState.selectedBranchId]);

  const selectedEmployee = useMemo(() => {
    if (!widgetState.selectedEmployeeId) return null;
    return employees.find((emp) => emp.id === widgetState.selectedEmployeeId) ?? null;
  }, [employees, widgetState.selectedEmployeeId]);

  const selectedDepartment = useMemo(() => {
    if (!widgetState.selectedDepartmentId) return null;
    return departments.find((d) => d.id === widgetState.selectedDepartmentId) ?? null;
  }, [departments, widgetState.selectedDepartmentId]);

  const stepTitle: ReactNode = useMemo(() => {
    const { currentStep, selectionMode } = widgetState;

    switch (currentStep) {
      case WidgetStep.BRANCH_SELECTION:
        return 'Выберите филиал';

      case WidgetStep.NEXT_STEPS:
        return (
          <div className='next-steps-image-container'>
            <img src={defaultImage as string} alt='Default' className='next-steps-image' />
          </div>
        );

      case WidgetStep.SPECIALIST_SELECTION:
        return selectionMode === SelectionMode.DEPARTMENT ? 'Выберите отделение' : 'Выберите специалиста';

      case WidgetStep.DEPARTMENT_SPECIALISTS_SELECTION:
        return selectedDepartment ? selectedDepartment.name : 'Выберите специалиста';

      case WidgetStep.DOCTOR_INFO: {
        const fullName = selectedEmployee ? formatEmployeeFullName(selectedEmployee) : '';
        return fullName || 'Информация о враче';
      }

      case WidgetStep.DATE_TIME_SELECTION:
        return 'Выберите дату и время';

      case WidgetStep.PHONE_INPUT:
        return 'Введите номер телефона';

      case WidgetStep.APPOINTMENT_DETAILS:
        return 'Детали записи';

      case WidgetStep.APPOINTMENT_CONFIRMATION:
        return (
          <div className='appointment-confirmation-image-container'>
            <img src={undefined} alt='' className='appointment-confirmation-image' />
            <div className='appointment-confirmation-success-icon'>
              <CheckCircleOutlined />
            </div>
          </div>
        );

      case WidgetStep.PRIVACY_POLICY:
        return 'Политика конфиденциальности';

      default:
        return '';
    }
  }, [widgetState, selectedDepartment, selectedEmployee]);

  const shouldShowBack =
    widgetState.currentStep !== WidgetStep.BRANCH_SELECTION &&
    widgetState.currentStep !== WidgetStep.NEXT_STEPS &&
    widgetState.currentStep !== WidgetStep.APPOINTMENT_CONFIRMATION;

  const isImageHeader = widgetState.currentStep === WidgetStep.APPOINTMENT_CONFIRMATION;

  const content = useMemo(() => {
    const { currentStep } = widgetState;

    if (currentStep === WidgetStep.BRANCH_SELECTION) {
      if (loadingBranches) {
        return (
          <div className='loader'>
            <Spin size='large' />
          </div>
        );
      }
      return <BranchSelection branches={branches} yandexMapFrameCode={widgetState.config?.yandexMapFrameCode} />;
    }

    if (currentStep === WidgetStep.NEXT_STEPS) {
      return <NextSteps selectedBranch={selectedBranch} />;
    }

    if (currentStep === WidgetStep.SPECIALIST_SELECTION) {
      if (loadingEmployees || loadingDepartments) {
        return (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Spin size='large' />
          </div>
        );
      }
      return (
        <SpecialistSelection
          employees={employees}
          departments={departments}
          selectedEmployeeId={widgetState.selectedEmployeeId}
          selectedDepartmentId={widgetState.selectedDepartmentId}
          selectionMode={widgetState.selectionMode}
        />
      );
    }

    if (currentStep === WidgetStep.DEPARTMENT_SPECIALISTS_SELECTION) {
      if (loadingEmployees) {
        return (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Spin size='large' />
          </div>
        );
      }
      return (
        <DepartmentSpecialistsSelection
          employees={employees}
          selectedDepartment={selectedDepartment}
          selectedEmployeeId={widgetState.selectedEmployeeId}
        />
      );
    }

    if (currentStep === WidgetStep.DOCTOR_INFO) {
      return <DoctorInfo employee={selectedEmployee} />;
    }

    if (currentStep === WidgetStep.DATE_TIME_SELECTION) {
      return <DateTimeSelection selectedEmployee={selectedEmployee} />;
    }

    if (currentStep === WidgetStep.PHONE_INPUT) {
      return <PhoneInput />;
    }

    if (currentStep === WidgetStep.APPOINTMENT_DETAILS) {
      return (
        <AppointmentDetails
          selectedBranch={selectedBranch}
          selectedEmployee={selectedEmployee}
          selectedDateTime={widgetState.selectedTimeSlot}
          phone={widgetState.phone}
          isNewUser={widgetState.isNewUser}
        />
      );
    }

    if (currentStep === WidgetStep.APPOINTMENT_CONFIRMATION) {
      return (
        <AppointmentConfirmation
          selectedBranch={selectedBranch}
          selectedEmployee={selectedEmployee}
          selectedDateTime={widgetState.selectedTimeSlot}
          phone={widgetState.phone}
          selectedPetId={widgetState.selectedPetId}
        />
      );
    }

    if (currentStep === WidgetStep.PRIVACY_POLICY) {
      return <PrivacyPolicy />;
    }

    return null;
  }, [
    widgetState,
    branches,
    departments,
    employees,
    loadingBranches,
    loadingDepartments,
    loadingEmployees,
    selectedBranch,
    selectedDepartment,
    selectedEmployee,
  ]);

  const footer = (
    <div className='getwell-widget-footer'>
      <span className='getwell-widget-footer-text'>Работает на</span>
      <img
        src="data:image/svg+xml,%3Csvg width='80' height='18' viewBox='0 0 80 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15.3359 0.181152C16.6830 0.181264 17.7754 1.27353 17.7754 2.62061V15.4263C17.7753 16.7733 16.6829 17.8656 15.3359 17.8657H2.53027C1.1832 17.8657 0.0909305 16.7733 0.0908203 15.4263V2.62061C0.0908203 1.27346 1.18313 0.181152 2.53027 0.181152H15.3359ZM4.98535 5.78564C4.82461 5.30236 4.29387 5.05007 3.81738 5.22998C3.35376 5.40509 3.12037 5.92277 3.29590 6.38623L3.74609 7.57568C3.76375 7.64687 3.78714 7.72113 3.81641 7.79834V7.79932L5.47656 12.2417C5.59197 12.5391 5.74138 12.7489 5.91797 12.8823C6.09549 13.0074 6.30685 13.0718 6.55762 13.0718C6.81587 13.0717 7.02478 13.0034 7.19238 12.8726C7.36241 12.7309 7.50508 12.5113 7.61328 12.2036L8.57324 9.4165L9.58984 12.2280C9.70581 12.5269 9.85192 12.7373 10.0215 12.8706C10.1983 13.0032 10.4126 13.0718 10.6709 13.0718C10.9207 13.0717 11.1318 13.0033 11.3096 12.8696C11.4860 12.7368 11.6316 12.5278 11.7393 12.23L11.7402 12.2271L12.29 10.9116C12.3899 10.6560 12.4444 10.3348 12.4229 10.1284V10.1265L12.4219 10.1245C12.4076 9.91852 12.3382 9.76151 12.2188 9.64404C12.1055 9.53271 11.9324 9.46729 11.6787 9.46729C11.5056 9.46737 11.3414 9.52025 11.1836 9.63135L11.1816 9.6333L11.1797 9.63428C11.0639 9.71005 11.0126 9.8240 10.9678 9.92236C10.9602 9.9391 10.9518 9.9556 10.9443 9.97119L10.6699 10.7876L9.55273 7.06494C9.47667 6.8472 9.37830 6.69626 9.26465 6.6001C9.22089 6.5631 9.13209 6.52548 9.01074 6.49756C8.89406 6.47071 8.76520 6.45658 8.65723 6.45654C8.55795 6.45654 8.43349 6.46966 8.31836 6.49658C8.19960 6.52436 8.10701 6.56258 8.05762 6.60205V6.60303H8.05664C7.94730 6.68842 7.84992 6.83638 7.77344 7.06396L6.67383 10.7280L5.50098 7.32373C5.48368 7.27351 5.46675 7.22589 5.44922 7.18115L4.98535 5.78564ZM12.7598 3.68799C12.3831 3.68799 12.0771 3.99397 12.0771 4.37061V5.5083H11.0176C10.6780 5.50831 10.4024 5.78395 10.4023 6.12354C10.4023 6.46318 10.6779 6.73876 11.0176 6.73877H12.0771V7.87744C12.0774 8.25390 12.3833 8.55908 12.7598 8.55908C13.1361 8.55888 13.4412 8.25377 13.4414 7.87744V6.73877H14.5010C14.8406 6.73877 15.1162 6.46318 15.1162 6.12354C15.1161 5.78394 14.8406 5.50830 14.5010 5.50830H13.4414V4.37061C13.4414 3.99409 13.1362 3.68819 12.7598 3.68799Z' fill='%23C9C9C9'/%3E%3C/svg%3E"
        alt='Get well'
        className='getwell-widget-footer-logo'
      />
    </div>
  );

  if (withoutDrawer) {
    return (
      <div className='getwell-widget-fullscreen'>
        <div className='getwell-widget-fullscreen-header'>
          {shouldShowBack && <LeftOutlined className='department-specialists-selection-back' onClick={goBack} />}
          {stepTitle}
        </div>
        <div className='getwell-widget-fullscreen-content'>{content}</div>
        <div className='getwell-widget-fullscreen-footer'>{footer}</div>
      </div>
    );
  }

  return (
    <Drawer
      title={
        <span className='drawer-title'>
          {shouldShowBack && <LeftOutlined className='department-specialists-selection-back' onClick={goBack} />}
          {stepTitle}
        </span>
      }
      classNames={{
        header: `${isImageHeader ? 'image-header' : ''}`,
      }}
      placement='right'
      onClose={onClose}
      open={open}
      width={drawerWidth}
      className='getwell-widget-drawer'
      footer={footer}
    >
      <div className='getwell-widget-content'>{content}</div>
    </Drawer>
  );
};
