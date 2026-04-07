import { Input } from 'antd';
import type { TextAreaProps } from 'antd/es/input';
import React from 'react';
import { FormField } from '../FormField/FormField';

interface CustomTextAreaProps extends TextAreaProps {
  text: string;
}

const CustomTextArea: React.FC<CustomTextAreaProps> = ({ text, ...rest }) => {
  const hasValue = !!rest.value;
  return (
    <FormField label={text} hasValue={hasValue}>
      <Input.TextArea
        {...rest}
        size='large'
        style={{
          paddingTop: `${hasValue ? '12px' : '12px'}`,
          overflowY: 'auto',
          resize: 'none',
          borderBottom: '1px solid var(--widget-border-secondary)',
        }}
        variant='borderless'
        rows={1}
        maxLength={100}
      />
    </FormField>
  );
};

export default CustomTextArea;
