import { Select, type SelectProps } from 'antd';
import React from 'react';
import { FormField } from '../FormField/FormField';

interface CustomSelectProps extends SelectProps {
  text: string;
}

const CustomSelector: React.FC<CustomSelectProps> = ({ text, ...rest }) => {
  const hasValue = !!rest.value;

  return (
    <FormField label={text} required={Boolean(text)} hasValue={hasValue}>
      <Select
        {...rest}
        notFoundContent={'Выберите дату брони'}
        size='large'
        variant='borderless'
        style={{
          height: 'var(--widget-field-height)',
          width: '100%',
          borderBottom: '1px solid var(--widget-field-line-color)',
        }}
      />
    </FormField>
  );
};

export default CustomSelector;
