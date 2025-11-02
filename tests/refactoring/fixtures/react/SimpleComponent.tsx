import React from 'react';

interface Props {
  title: string;
  onPress?: () => void;
}

const SimpleComponent: React.FC<Props> = ({ title, onPress }) => {
  return (
    <div onClick={onPress}>
      <h1>{title}</h1>
    </div>
  );
};

export default SimpleComponent;
