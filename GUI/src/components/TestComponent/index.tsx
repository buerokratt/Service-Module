import React, { FC, PropsWithChildren } from 'react';

type TestComponentProps = PropsWithChildren<{
  title?: string;
  className?: string;
}>;

const TestComponent: FC<TestComponentProps> = ({ title = 'Test', children, className }) => {
  return (
    <div className={className} data-testid="test-component">
      <h1>{title}</h1>
      {children}
    </div>
  );
};

export default TestComponent;
