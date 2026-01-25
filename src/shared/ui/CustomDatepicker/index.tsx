import { DatePicker, type DatePickerProps } from 'antd';
import locale from 'antd/lib/date-picker/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import updateLocale from 'dayjs/plugin/updateLocale';
import React, { useState } from 'react';

export enum DayOfWeek {
  Monday = 'MONDAY',
  Tuesday = 'TUESDAY',
  Wednesday = 'WEDNESDAY',
  Thursday = 'THURSDAY',
  Friday = 'FRIDAY',
  Saturday = 'SATURDAY',
  Sunday = 'SUNDAY',
}
dayjs.locale('ru');
dayjs.extend(updateLocale);

dayjs.updateLocale('ru', {
  weekdays: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
});

interface CustomDatePickerProps extends DatePickerProps {
  text: string;
}

const dayOfWeekToDayjsMap: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const CustomDatepicker: React.FC<CustomDatePickerProps> = ({ text, ...rest }) => {
  const [open, setOpen] = useState(false);
  const hasValue = !!rest.value;

  return (
    <div className='input-container'>
      <div
        className={`custom-placeholder ${hasValue || open ? 'has-value' : ''}`}
        >
        {text} <span className='redmark'>*</span>
      </div>
      <DatePicker
        {...rest}
        size='large'
        open={open}
        onOpenChange={setOpen}
        placeholder=' '
        onChange={(date) => {
          rest.onChange?.(date, date?.format('YYYY-MM-DD'));
        }}
        style={{ height: '56px', width: '100%', borderBottom: '1px solid var(--widget-border-secondary)' }}
        suffixIcon={null}
        locale={locale}
        format={'DD.MM.YYYY'}
        showNow={false}
        allowClear={false}
        mode='date'
        variant='borderless'
        inputReadOnly
      />
    </div>
  );
};

export default CustomDatepicker;
