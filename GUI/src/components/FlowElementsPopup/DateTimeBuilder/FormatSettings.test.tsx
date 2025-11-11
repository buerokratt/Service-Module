import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DateTimeBuilderProvider } from './DateTimeBuilderProvider';
import FormatSettings from './FormatSettings';

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

describe('FormatSettings', () => {
  it('should render with context provider', () => {
    render(
      <DateTimeBuilderProvider>
        <FormatSettings />
      </DateTimeBuilderProvider>,
    );

    expect(screen.getByText('serviceFlow.previousVariables.dateAndTime.format')).toBeInTheDocument();
    expect(screen.getByText('serviceFlow.previousVariables.dateAndTime.dateOrder')).toBeInTheDocument();
    expect(screen.getByText('serviceFlow.previousVariables.dateAndTime.separator')).toBeInTheDocument();
  });

  it('should hide date order and separator when format type is yearOnly', () => {
    render(
      <DateTimeBuilderProvider>
        <FormatSettings />
      </DateTimeBuilderProvider>,
    );

    // Initially visible
    expect(screen.getByText('serviceFlow.previousVariables.dateAndTime.dateOrder')).toBeInTheDocument();
    expect(screen.getByText('serviceFlow.previousVariables.dateAndTime.separator')).toBeInTheDocument();
  });
});
