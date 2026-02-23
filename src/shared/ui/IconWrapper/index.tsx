import React from 'react';


interface Props {
  src: string;
  size?: number | string;
  iconSize?: number | string;
  withBackground?: boolean;
  color?: string;
  backgroundColor?: string;
  style?: React.CSSProperties;
}

const toCssSize = (value: number | string): string =>
  typeof value === 'number' ? `${value}px` : value;

const IconWrapper: React.FC<Props> = ({
  src,
  size = 24,
  iconSize,
  withBackground = true,
  color = 'var(--widget-primary-color)',
  backgroundColor = 'var(--widget-tag-background, var(--widget-background-secondary))',
  style,
}) => {
  const wrapperSize = toCssSize(size);
  const resolvedIconSize = toCssSize(iconSize ?? (withBackground ? '55%' : size));

  const iconStyle: React.CSSProperties = {
    width: resolvedIconSize,
    height: resolvedIconSize,
    backgroundColor: color,
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    flexShrink: 0,
  };

  return (
    <span
      style={{
        width: wrapperSize,
        height: wrapperSize,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: withBackground ? '50%' : 0,
        backgroundColor: withBackground ? backgroundColor : 'transparent',
        flexShrink: 0,
        ...style,
      }}>
      <span style={iconStyle} />
    </span>

  );
};

export default IconWrapper;
