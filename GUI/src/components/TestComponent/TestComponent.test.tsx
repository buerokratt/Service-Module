import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import TestComponent from './index';

describe('TestComponent', () => {
  it('should render with default props', () => {
    render(<TestComponent>Hello World</TestComponent>);

    const component = screen.getByTestId('test-component');
    expect(component).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    render(<TestComponent title="Custom Title">Content</TestComponent>);

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<TestComponent className="custom-class">Content</TestComponent>);

    const component = screen.getByTestId('test-component');
    expect(component).toHaveClass('custom-class');
  });

  it('should render without children', () => {
    render(<TestComponent />);

    const component = screen.getByTestId('test-component');
    expect(component).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
