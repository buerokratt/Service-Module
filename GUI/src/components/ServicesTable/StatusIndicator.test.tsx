import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import StatusIndicator from './StatusIndicator';

// Mock the Tooltip component
vi.mock('components/Tooltip', () => ({
  default: ({ children, content }: { children: ReactNode; content: string }) => (
    <div data-testid="tooltip" data-content={content}>
      {children}
    </div>
  ),
}));

// Mock the string utility
vi.mock('utils/string-util', () => ({
  fromUpperSnakeCase: (str: string) =>
    str
      .toLowerCase()
      .replace('_', ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase()),
}));

describe('StatusIndicator', () => {
  it('should render with default size', () => {
    render(<StatusIndicator status="TRAINED" />);

    const indicator = screen.getByTestId('tooltip');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute('data-content', 'Trained');
  });

  it('should render with custom size', () => {
    render(<StatusIndicator status="PENDING" size={12} />);

    const indicator = screen.getByTestId('tooltip');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute('data-content', 'Pending');
  });

  it('should show green color for TRAINED status', () => {
    render(<StatusIndicator status="TRAINED" />);

    const circle = screen.getByTestId('tooltip').querySelector('div');
    expect(circle).toHaveStyle({ backgroundColor: 'var(--veera-color-sea-green-10)' });
  });

  it('should show red color for non-TRAINED status', () => {
    render(<StatusIndicator status="PENDING" />);

    const circle = screen.getByTestId('tooltip').querySelector('div');
    expect(circle).toHaveStyle({ backgroundColor: 'var(--veera-color-jasper-10)' });
  });

  it('should show red color for NOT_TRAINED status', () => {
    render(<StatusIndicator status="NOT_TRAINED" />);

    const circle = screen.getByTestId('tooltip').querySelector('div');
    expect(circle).toHaveStyle({ backgroundColor: 'var(--veera-color-jasper-10)' });
  });

  it('should have correct styling', () => {
    render(<StatusIndicator status="TRAINED" size={10} />);

    const circle = screen.getByTestId('tooltip').querySelector('div');
    expect(circle).toHaveStyle({
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      cursor: 'pointer',
    });
  });

  it('should format status text correctly', () => {
    render(<StatusIndicator status="NOT_TRAINED" />);

    const indicator = screen.getByTestId('tooltip');
    expect(indicator).toHaveAttribute('data-content', 'Not Trained');
  });

  it('should handle empty status', () => {
    render(<StatusIndicator status="" />);

    const indicator = screen.getByTestId('tooltip');
    expect(indicator).toHaveAttribute('data-content', '');
  });
});
