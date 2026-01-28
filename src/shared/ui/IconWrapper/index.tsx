import React from 'react';


interface Props {
  src: string;
}

const IconWrapper: React.FC<Props> = ({ src }) => {

  return (
    <img src={src} style={{
      fontSize: "20px",
      color: 'rgba(0, 0, 0, 0.45)',
      flexShrink: 0,
    }} />

  );
};

export default IconWrapper;
