import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import DateTimePreview from './DateTimePreview';
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

vi.mock('i18next', () => ({
  t: (key: string) => key,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('DateTimePreview', () => {
  it('should render with context provider', () => {
    render(
      <DateTimeBuilderProvider>
        <DateTimePreview />
      </DateTimeBuilderProvider>,
    );

    expect(screen.getByText('serviceFlow.previousVariables.dateAndTime.title')).toBeInTheDocument();
    expect(screen.getByText(/^\d{4}-\d{2}-\d{2}$/)).toBeInTheDocument();
  });
});
