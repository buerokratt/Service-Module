import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import DateTimeBuilder from './index';

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

describe('DateTimeBuilder', () => {
  it('should render with required props', () => {
    const border = '1px solid #ccc';
    const popupBodyCss = { padding: 16 };

    render(<DateTimeBuilder border={border} popupBodyCss={popupBodyCss} />);

    // Title appears in both label and OutputElementBox, so use getAllByText
    const titles = screen.getAllByText('serviceFlow.previousVariables.dateAndTime.title');
    expect(titles.length).toBeGreaterThan(0);
    expect(titles[0]).toBeInTheDocument();
  });
});
