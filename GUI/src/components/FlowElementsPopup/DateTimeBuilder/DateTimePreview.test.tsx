import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DateTimeBuilderProvider } from './DateTimeBuilderProvider';
import DateTimePreview from './DateTimePreview';

// Mock dependencies

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

  it('should render OutputElementBox with draggable attribute', () => {
    render(
      <DateTimeBuilderProvider>
        <DateTimePreview />
      </DateTimeBuilderProvider>,
    );

    // OutputElementBox should be draggable when dragData is present
    const outputBox = screen.getByText('serviceFlow.previousVariables.dateAndTime.title').closest('[draggable]');
    expect(outputBox).toBeInTheDocument();
    expect(outputBox).toHaveAttribute('draggable', 'true');
  });

  it('should display evaluated date', () => {
    render(
      <DateTimeBuilderProvider>
        <DateTimePreview />
      </DateTimeBuilderProvider>,
    );

    const dateSpan = screen.getByText(/^\d{4}-\d{2}-\d{2}$/);
    expect(dateSpan).toBeInTheDocument();
    expect(dateSpan.tagName).toBe('SPAN');
  });

  it('should render title inside OutputElementBox', () => {
    render(
      <DateTimeBuilderProvider>
        <DateTimePreview />
      </DateTimeBuilderProvider>,
    );

    const title = screen.getByText('serviceFlow.previousVariables.dateAndTime.title');
    expect(title).toBeInTheDocument();
    // The title should be inside a draggable element (OutputElementBox)
    const draggableParent = title.closest('[draggable]');
    expect(draggableParent).toBeInTheDocument();
  });
});
