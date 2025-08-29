import { describe, expect, it, vi } from 'vitest';

import { translateObjectKeys } from './translation-util';

// Mock i18next
vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key: string, options: any) => {
      if (key === 'test.translation' && options?.returnObjects) {
        return {
          name: 'translated_name',
          age: 'translated_age',
          email: 'translated_email',
        };
      }
      return key as any;
    }),
  },
  t: vi.fn((key: string, options: any) => {
    if (key === 'test.translation' && options?.returnObjects) {
      return {
        name: 'translated_name',
        age: 'translated_age',
        email: 'translated_email',
      };
    }
    return key as any;
  }),
}));

describe('translateObjectKeys', () => {
  it('should translate object keys using the provided translation path', () => {
    const testObj = {
      name: 'John',
      age: 25,
      email: 'john@example.com',
    };

    const result = translateObjectKeys(testObj, 'test.translation');

    expect(result).toEqual({
      translated_name: 'John',
      translated_age: 25,
      translated_email: 'john@example.com',
    });
  });

  it('should preserve original keys if translation is not found', () => {
    const testObj = {
      name: 'John',
      age: 25,
    };

    const result = translateObjectKeys(testObj, 'nonexistent.translation');

    expect(result).toEqual({
      name: 'John',
      age: 25,
    });
  });
});
