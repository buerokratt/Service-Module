import { describe, expect, it, vi } from 'vitest';

import { createDateTimeDragData, generateDateCode, getBaseOptions, updateDateOrder } from './date-time-utils';

// Mock i18next
vi.mock('i18next', () => ({
  t: (key: string) => key,
}));

// Mock uuid to return predictable values for testing
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-123'),
}));

// Mock stringToTemplate
vi.mock('utils/string-util', () => ({
  stringToTemplate: (str: string) => `template(${str})`,
  stringToEscapedTemplate: (str: string) => `escapedTemplate(${str})`,
}));

describe('date-time-utils', () => {
  describe('getBaseOptions', () => {
    it('should return all base options with labels and values', () => {
      const options = getBaseOptions();

      expect(options).toHaveLength(7);
      expect(options[0]).toEqual({
        label: 'serviceFlow.previousVariables.dateAndTime.now',
        value: 'now',
      });
      expect(options.some((opt) => opt.value === 'startOfDay')).toBe(true);
      expect(options.some((opt) => opt.value === 'startOfMonth')).toBe(true);
      expect(options.some((opt) => opt.value === 'startOfYear')).toBe(true);
      expect(options.some((opt) => opt.value === 'endOfDay')).toBe(true);
      expect(options.some((opt) => opt.value === 'endOfMonth')).toBe(true);
      expect(options.some((opt) => opt.value === 'endOfYear')).toBe(true);
    });

    it('should return options with correct structure', () => {
      const options = getBaseOptions();

      options.forEach((option) => {
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('value');
        expect(typeof option.label).toBe('string');
        expect(typeof option.value).toBe('string');
      });
    });
  });

  describe('generateDateCode', () => {
    it('should generate code for now with default format', () => {
      const code = generateDateCode('now');

      expect(code).toContain('new Date()');
      expect(code).toContain('getFullYear()');
      expect(code).toContain('getMonth()');
      expect(code).toContain('getDate()');
      expect(code).toContain("join('-')");
    });

    it('should generate code with days offset', () => {
      const code = generateDateCode('now', { days: '5' });

      expect(code).toContain('d.getTime() + 432000000');
      expect(code).toContain('d = new Date(d.getTime() + 432000000)');
    });

    it('should generate code with negative days offset', () => {
      const code = generateDateCode('now', { days: '-3' });

      expect(code).toContain('d.getTime() + -259200000');
    });

    it('should generate code with months offset', () => {
      const code = generateDateCode('now', { months: '2' });

      expect(code).toContain('d.setMonth(d.getMonth() + 2)');
    });

    it('should generate code with years offset', () => {
      const code = generateDateCode('now', { years: '1' });

      expect(code).toContain('d.setFullYear(d.getFullYear() + 1)');
    });

    it('should generate code with multiple offsets', () => {
      const code = generateDateCode('now', { days: '1', months: '2', years: '3' });

      expect(code).toContain('d.getTime() + 86400000');
      expect(code).toContain('d.setMonth(d.getMonth() + 2)');
      expect(code).toContain('d.setFullYear(d.getFullYear() + 3)');
    });

    it('should generate code with time precision', () => {
      const code = generateDateCode('now', {
        isTimePrecisionEnabled: true,
        time: '12:30:45.123',
      });

      expect(code).toContain('d.setHours(12, 30, 45, 123)');
    });

    it('should handle time without milliseconds', () => {
      const code = generateDateCode('now', {
        isTimePrecisionEnabled: true,
        time: '10:20:30',
      });

      expect(code).toContain('d.setHours(10, 20, 30, 0)');
    });

    it('should handle time with only hours and minutes', () => {
      const code = generateDateCode('now', {
        isTimePrecisionEnabled: true,
        time: '15:45',
      });

      expect(code).toContain('d.setHours(15, 45, 0, 0)');
    });

    it('should generate code for yearOnly format', () => {
      const code = generateDateCode('now', {
        format: { type: 'yearOnly' },
      });

      expect(code).toContain('d.getFullYear().toString()');
    });

    it('should generate code for dateOnly format with custom separator', () => {
      const code = generateDateCode('now', {
        format: { type: 'dateOnly', separator: '/', dateOrder: ['DD', 'MM', 'YYYY'] },
      });

      expect(code).toContain("join('/')");
      expect(code).toContain('d.getDate()');
      expect(code).toContain('d.getMonth()');
      expect(code).toContain('d.getFullYear()');
    });

    it('should generate code for timestamp format', () => {
      const code = generateDateCode('now', {
        format: { type: 'timestamp', separator: '-', dateOrder: ['YYYY', 'MM', 'DD'] },
      });

      expect(code).toContain("join('-')");
      expect(code).toContain("'T'");
      expect(code).toContain("'Z'");
      expect(code).toContain('getHours()');
      expect(code).toContain('getMinutes()');
      expect(code).toContain('getSeconds()');
    });

    it('should generate code for timestampMs format', () => {
      const code = generateDateCode('now', {
        format: { type: 'timestampMs', separator: '-', dateOrder: ['YYYY', 'MM', 'DD'] },
      });

      expect(code).toContain("join('-')");
      expect(code).toContain("'T'");
      expect(code).toContain("'.'");
      expect(code).toContain("'Z'");
      expect(code).toContain('getHours()');
      expect(code).toContain('getMilliseconds()');
    });

    it('should generate code for startOfDay base', () => {
      const code = generateDateCode('startOfDay');

      expect(code).toContain('setHours(0, 0, 0, 0)');
    });

    it('should generate code for endOfDay base', () => {
      const code = generateDateCode('endOfDay');

      expect(code).toContain('setHours(23, 59, 59, 999)');
    });

    it('should not include operations when all offsets are zero', () => {
      const code = generateDateCode('now', { days: '0', months: '0', years: '0' });

      expect(code).not.toContain('d.getTime()');
      expect(code).not.toContain('setMonth');
      expect(code).not.toContain('setFullYear');
    });

    it('should use IIFE pattern', () => {
      const code = generateDateCode('now');

      expect(code).toMatch(/^\(function\(\)/);
      expect(code).toMatch(/}\)\(\)$/);
    });
  });

  describe('createDateTimeDragData', () => {
    it('should create drag data with correct structure', () => {
      const dateCode = '(function() { const d = new Date(); return d.getFullYear().toString(); })()';
      const dragData = createDateTimeDragData(dateCode);

      expect(dragData).toHaveProperty('id');
      expect(dragData).toHaveProperty('key');
      expect(dragData).toHaveProperty('value');
      expect(dragData).toHaveProperty('data');
      expect(dragData.key).toBe('dateTime');
      expect(dragData.data).toBe(dateCode);
    });

    it('should convert dateCode to template format', () => {
      const dateCode = "(function() { return 'test'; })()";
      const dragData = createDateTimeDragData(dateCode);

      expect(dragData.value).toBe(`escapedTemplate(${dateCode})`);
    });

    it('should generate unique id for each call', () => {
      const dateCode = "(function() { return 'test'; })()";
      const dragData1 = createDateTimeDragData(dateCode);
      const dragData2 = createDateTimeDragData(dateCode);

      expect(dragData1.id).toBe('test-uuid-123');
      expect(dragData2.id).toBe('test-uuid-123');
    });
  });

  describe('updateDateOrder', () => {
    it('should update date order at specified index', () => {
      const currentOrder: ['YYYY', 'MM', 'DD'] = ['YYYY', 'MM', 'DD'];
      const newOrder = updateDateOrder(currentOrder, 0, 'DD');

      // When setting index 0 to 'DD', it swaps with existing 'DD' at index 2
      expect(newOrder).toEqual(['DD', 'MM', 'YYYY']);
    });

    it('should swap values when new value exists in another position', () => {
      const currentOrder: ['YYYY', 'MM', 'DD'] = ['YYYY', 'MM', 'DD'];
      const newOrder = updateDateOrder(currentOrder, 0, 'MM');

      expect(newOrder).toEqual(['MM', 'YYYY', 'DD']);
    });

    it('should handle swap at different positions', () => {
      const currentOrder: ['YYYY', 'MM', 'DD'] = ['YYYY', 'MM', 'DD'];
      const newOrder = updateDateOrder(currentOrder, 2, 'YYYY');

      expect(newOrder).toEqual(['DD', 'MM', 'YYYY']);
    });

    it('should not swap when setting same value at same position', () => {
      const currentOrder: ['YYYY', 'MM', 'DD'] = ['YYYY', 'MM', 'DD'];
      const newOrder = updateDateOrder(currentOrder, 1, 'MM');

      expect(newOrder).toEqual(['YYYY', 'MM', 'DD']);
    });

    it('should handle all date parts correctly', () => {
      const currentOrder: ['YYYY', 'MM', 'DD'] = ['YYYY', 'MM', 'DD'];

      const order1 = updateDateOrder(currentOrder, 0, 'MM');
      expect(order1).toEqual(['MM', 'YYYY', 'DD']);

      const order2 = updateDateOrder(['MM', 'YYYY', 'DD'], 1, 'DD');
      expect(order2).toEqual(['MM', 'DD', 'YYYY']);

      const order3 = updateDateOrder(['MM', 'DD', 'YYYY'], 2, 'MM');
      expect(order3).toEqual(['YYYY', 'DD', 'MM']);
    });

    it('should return new array without mutating original', () => {
      const currentOrder: ['YYYY', 'MM', 'DD'] = ['YYYY', 'MM', 'DD'];
      const newOrder = updateDateOrder(currentOrder, 0, 'DD');

      expect(newOrder).not.toBe(currentOrder);
      expect(currentOrder).toEqual(['YYYY', 'MM', 'DD']);
    });
  });
});
