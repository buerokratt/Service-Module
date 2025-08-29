import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Button from './index';

describe('Button', () => {
  it('should render with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn', 'btn--primary', 'btn--m');
  });

  it('should render with custom appearance and size', () => {
    render(
      <Button appearance="secondary" size="s">
        Secondary Button
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Secondary Button' });
    expect(button).toHaveClass('btn', 'btn--secondary', 'btn--s');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole('button', { name: 'Disabled Button' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('btn--disabled');
  });

  it('should be disabled when appearance is loading', () => {
    render(<Button appearance="loading">Loading Button</Button>);

    const button = screen.getByRole('button', { name: 'Loading Button' });
    expect(button).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);

    const button = screen.getByRole('button', { name: 'Custom Button' });
    expect(button).toHaveClass('custom-class');
  });

  it('should pass through additional props', () => {
    const handleClick = () => {};
    render(
      <Button onClick={handleClick} data-testid="test-button">
        Test Button
      </Button>,
    );

    const button = screen.getByTestId('test-button');
    expect(button).toBeInTheDocument();
  });
});
