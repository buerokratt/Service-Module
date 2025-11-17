import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import DateSettings from './DateSettings';
import { DateTimeBuilderProvider } from './DateTimeBuilderProvider';

// Mock dependencies
vi.mock('utils/object-util', () => ({
  getTypeColor: () => ({ color: '#000000' }),
}));

vi.mock('utils/string-util', () => ({
  stringToTemplate: (str: string) => `template(${str})`,
}));

vi.mock('uuid', () => ({
  v4: () => 'test-uuid-123',
}));

vi.mock('i18next', () => {
  const mockI18n = {
    use: vi.fn().mockReturnThis(),
    init: vi.fn().mockResolvedValue(undefined),
    t: (key: string) => key,
  };
  return {
    default: mockI18n,
    t: mockI18n.t,
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  initReactI18next: {},
}));

describe('DateSettings', () => {
  it('should render with context provider', () => {
    render(
      <DateTimeBuilderProvider>
        <DateSettings />
      </DateTimeBuilderProvider>,
    );

    expect(screen.getByText('serviceFlow.previousVariables.dateAndTime.base')).toBeInTheDocument();
    expect(screen.getByText('serviceFlow.previousVariables.dateAndTime.offset')).toBeInTheDocument();
    expect(screen.getByText('serviceFlow.previousVariables.dateAndTime.time')).toBeInTheDocument();
  });

  it('should show time input when time precision is enabled', () => {
    render(
      <DateTimeBuilderProvider>
        <DateSettings />
      </DateTimeBuilderProvider>,
    );

    const checkbox = screen.getByLabelText('serviceFlow.previousVariables.dateAndTime.setTime');
    fireEvent.click(checkbox);

    const timeInput = screen.getByPlaceholderText('HH:mm:ss.SSS');
    expect(timeInput).toBeInTheDocument();
  });
});
