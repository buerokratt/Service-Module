import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useDateTimeBuilderContext } from './DateTimeBuilderContext';
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

describe('useDateTimeBuilderContext', () => {
  it('should throw error when used outside DateTimeBuilderProvider', () => {
    // Suppress console.error for this test since we expect an error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useDateTimeBuilderContext());
    }).toThrow('useDateTimeBuilderContext must be used within DateTimeBuilderProvider');

    consoleSpy.mockRestore();
  });

  it('should return context value when used inside DateTimeBuilderProvider', () => {
    const { result } = renderHook(() => useDateTimeBuilderContext(), {
      wrapper: ({ children }: { children: ReactNode }) => <DateTimeBuilderProvider>{children}</DateTimeBuilderProvider>,
    });

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('state');
    expect(result.current).toHaveProperty('dateCode');
  });
});
