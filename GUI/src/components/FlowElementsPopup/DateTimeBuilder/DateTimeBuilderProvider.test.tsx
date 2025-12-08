import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useDateTimeBuilderContext } from './DateTimeBuilderContext';
import { DateTimeBuilderProvider } from './DateTimeBuilderProvider';

// Mock dependencies

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

  it('should have correct default state values', () => {
    const { result } = renderHook(() => useDateTimeBuilderContext(), {
      wrapper: ({ children }: { children: ReactNode }) => <DateTimeBuilderProvider>{children}</DateTimeBuilderProvider>,
    });

    expect(result.current.state.base).toBe('now');
    expect(result.current.state.days).toBe('0');
    expect(result.current.state.months).toBe('0');
    expect(result.current.state.years).toBe('0');
    expect(result.current.state.isTimePrecisionEnabled).toBe(false);
    expect(result.current.state.time).toBe('21:00:00.000');
    expect(result.current.state.formatType).toBe('dateOnly');
    expect(result.current.state.dateOrder).toEqual(['YYYY', 'MM', 'DD']);
    expect(result.current.state.separator).toBe('-');
  });

  it('should provide all computed values', () => {
    const { result } = renderHook(() => useDateTimeBuilderContext(), {
      wrapper: ({ children }: { children: ReactNode }) => <DateTimeBuilderProvider>{children}</DateTimeBuilderProvider>,
    });

    expect(result.current.formatOptions).toBeDefined();
    expect(result.current.dateCode).toBeDefined();
    expect(result.current.dragData).toBeDefined();
    expect(result.current.evaluatedDate).toBeDefined();
    expect(result.current.borderColor).toBeDefined();
  });

  it('should update state when setters are called', () => {
    const { result } = renderHook(() => useDateTimeBuilderContext(), {
      wrapper: ({ children }: { children: ReactNode }) => <DateTimeBuilderProvider>{children}</DateTimeBuilderProvider>,
    });

    act(() => {
      result.current.setBase('startOfDay');
    });
    expect(result.current.state.base).toBe('startOfDay');

    act(() => {
      result.current.setDays('5');
    });
    expect(result.current.state.days).toBe('5');

    act(() => {
      result.current.setMonths('2');
    });
    expect(result.current.state.months).toBe('2');

    act(() => {
      result.current.setYears('1');
    });
    expect(result.current.state.years).toBe('1');

    act(() => {
      result.current.setIsTimePrecisionEnabled(true);
    });
    expect(result.current.state.isTimePrecisionEnabled).toBe(true);

    act(() => {
      result.current.setTime('12:30:45.500');
    });
    expect(result.current.state.time).toBe('12:30:45.500');

    act(() => {
      result.current.setFormatType('timestamp');
    });
    expect(result.current.state.formatType).toBe('timestamp');

    act(() => {
      result.current.setDateOrder(['DD', 'MM', 'YYYY']);
    });
    expect(result.current.state.dateOrder).toEqual(['DD', 'MM', 'YYYY']);

    act(() => {
      result.current.setSeparator('/');
    });
    expect(result.current.state.separator).toBe('/');
  });

  it('should update computed values when state changes', () => {
    const { result } = renderHook(() => useDateTimeBuilderContext(), {
      wrapper: ({ children }: { children: ReactNode }) => <DateTimeBuilderProvider>{children}</DateTimeBuilderProvider>,
    });

    const initialDateCode = result.current.dateCode;
    const initialEvaluatedDate = result.current.evaluatedDate;

    act(() => {
      result.current.setDays('10');
    });

    // dateCode and evaluatedDate should update when state changes
    expect(result.current.dateCode).not.toBe(initialDateCode);
    expect(result.current.evaluatedDate).not.toBe(initialEvaluatedDate);
  });

  it('should update formatOptions when formatType changes', () => {
    const { result } = renderHook(() => useDateTimeBuilderContext(), {
      wrapper: ({ children }: { children: ReactNode }) => <DateTimeBuilderProvider>{children}</DateTimeBuilderProvider>,
    });

    // Initially formatType is 'dateOnly', so formatOptions should include dateOrder and separator
    expect(result.current.formatOptions.type).toBe('dateOnly');
    expect(result.current.formatOptions.dateOrder).toBeDefined();
    expect(result.current.formatOptions.separator).toBeDefined();

    act(() => {
      result.current.setFormatType('yearOnly');
    });

    // When formatType is 'yearOnly', formatOptions should not include dateOrder and separator
    expect(result.current.formatOptions.type).toBe('yearOnly');
    expect(result.current.formatOptions.dateOrder).toBeUndefined();
    expect(result.current.formatOptions.separator).toBeUndefined();
  });
});
