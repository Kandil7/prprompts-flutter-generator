/**
 * SimpleComponent.tsx
 * Test fixture: Simple React component without state
 */

import React from 'react';

interface SimpleComponentProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
}

const SimpleComponent: React.FC<SimpleComponentProps> = ({
  title,
  subtitle,
  onPress,
}) => {
  return (
    <div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {onPress && <button onClick={onPress}>Click Me</button>}
    </div>
  );
};

export default SimpleComponent;
