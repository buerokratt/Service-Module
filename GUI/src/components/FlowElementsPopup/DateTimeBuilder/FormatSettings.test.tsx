import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DateTimeBuilderProvider } from './DateTimeBuilderProvider';
import FormatSettings from './FormatSettings';

// Mock dependencies

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

  it('should render format type selector', () => {
    render(
      <DateTimeBuilderProvider>
        <FormatSettings />
      </DateTimeBuilderProvider>,
    );

    // Format type selector should be present (find by name attribute)
    const allComboboxes = screen.getAllByRole('combobox');
    const formatTypeSelector = allComboboxes.find((cb) => cb.getAttribute('name') === 'formatType');
    expect(formatTypeSelector).toBeInTheDocument();
    // Default is dateOnly
    expect(screen.getByText('serviceFlow.previousVariables.dateAndTime.dateOnly')).toBeInTheDocument();
  });

  it('should render date order selectors', () => {
    render(
      <DateTimeBuilderProvider>
        <FormatSettings />
      </DateTimeBuilderProvider>,
    );

    // Should have 3 date order selectors (for YYYY, MM, DD)
    const dateOrderSelectors = screen
      .getAllByRole('combobox')
      .filter((element) => element.getAttribute('name')?.startsWith('dateOrder'));
    expect(dateOrderSelectors).toHaveLength(3);
  });

  it('should render separator selector', () => {
    render(
      <DateTimeBuilderProvider>
        <FormatSettings />
      </DateTimeBuilderProvider>,
    );

    // Find separator selector by name attribute
    const allComboboxes = screen.getAllByRole('combobox');
    const separator = allComboboxes.find((cb) => cb.getAttribute('name') === 'separator');
    expect(separator).toBeInTheDocument();
  });

  it('should show date order and separator when format type is not yearOnly', () => {
    render(
      <DateTimeBuilderProvider>
        <FormatSettings />
      </DateTimeBuilderProvider>,
    );

    // Default formatType is 'dateOnly', so date order and separator should be visible
    expect(screen.getByText('serviceFlow.previousVariables.dateAndTime.dateOrder')).toBeInTheDocument();
    expect(screen.getByText('serviceFlow.previousVariables.dateAndTime.separator')).toBeInTheDocument();
  });
});
