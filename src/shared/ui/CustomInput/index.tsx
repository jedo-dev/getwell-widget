import { Input, type InputProps } from 'antd';
import React from 'react';
import { FormField } from '../FormField/FormField';

interface CustomInputProps extends InputProps {
  text: string;
}

const CustomInput: React.FC<CustomInputProps> = ({ text, ...rest }) => {
  const hasValue = !!rest.value;
  return (
    <FormField label={text} required={Boolean(text)} hasValue={hasValue}>
      <Input
        {...rest}
        size='large'
        variant='borderless'
        style={{
          height: 'var(--widget-field-height)',
          borderBottom: '1px solid var(--widget-field-line-color)',
          paddingTop: `${hasValue ? 'var(--widget-field-padding-top-filled)' : 'var(--widget-field-padding-top-default)'}`,
        }}
      />
    </FormField>
  );
};

export default CustomInput;
