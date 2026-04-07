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
          height: '56px',
          borderBottom: '1px solid var(--widget-border-secondary)',
          paddingTop: `${hasValue ? '18px' : '12px'}`,
        }}
      />
    </FormField>
  );
};

export default CustomInput;
