import { DatePicker, type DatePickerProps } from 'antd';
import locale from 'antd/lib/date-picker/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import updateLocale from 'dayjs/plugin/updateLocale';
import React, { useState } from 'react';
import { FormField } from '../FormField/FormField';

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
    <FormField
      label={text}
      required={Boolean(text)}
      hasValue={hasValue}
      isActive={open}
      hidePlaceholderWhenActive={hasValue}>
      <DatePicker
        {...rest}
        size='large'
        open={open}
        onOpenChange={setOpen}
        placeholder=' '
        onChange={(date) => {
          rest.onChange?.(date, date?.format('YYYY-MM-DD'));
        }}
        style={{
          height: 'var(--widget-field-height)',
          width: '100%',
          borderBottom: '1px solid var(--widget-field-line-color)',
        }}
        suffixIcon={null}
        locale={locale}
        format={'DD.MM.YYYY'}
        showNow={false}
        allowClear={false}
        mode='date'
        variant='borderless'
        inputReadOnly
      />
    </FormField>
  );
};

export default CustomDatepicker;
