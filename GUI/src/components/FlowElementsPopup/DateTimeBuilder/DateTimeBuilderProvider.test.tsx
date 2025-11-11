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

describe('DateTimeBuilderProvider', () => {
  it('should provide context to children', () => {
    const { result } = renderHook(() => useDateTimeBuilderContext(), {
      wrapper: ({ children }: { children: ReactNode }) => <DateTimeBuilderProvider>{children}</DateTimeBuilderProvider>,
    });

    expect(result.current).toBeDefined();
    expect(result.current.state).toBeDefined();
    expect(result.current.dateCode).toBeDefined();
  });
});
