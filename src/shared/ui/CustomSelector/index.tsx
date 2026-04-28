import { Select, type SelectProps } from 'antd';
import React from 'react';
import ChevronDownIcon from '../../../img/chevron-down-ic.svg';
import { FormField } from '../FormField/FormField';
import IconWrapper from '../IconWrapper';

interface CustomSelectProps extends SelectProps {
  text: string;
}

const CustomSelector: React.FC<CustomSelectProps> = ({ text, ...rest }) => {
  const hasValue = !!rest.value;

  return (
    <FormField label={text} required={Boolean(text)} hasValue={hasValue}>
      <Select
        {...rest}
        notFoundContent={'Не найдено'}
        size='large'
        variant='borderless'
        suffixIcon={
          <IconWrapper
            src={ChevronDownIcon}
            size={16}
            iconSize={16}
            withBackground={false}
            color='var(--widget-text-tertiary)'
            style={{ pointerEvents: 'none' }}
          />
        }
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
