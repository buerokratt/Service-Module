import { describe, expect, it } from 'vitest';

import {
  fromSnakeCase,
  fromUpperSnakeCase,
  getLastDigits,
  isTemplate,
  removeNestedTemplates,
  removeTrailingUnderscores,
  stringToArray,
  stringToTemplate,
  templateToString,
  toSnakeCase,
} from './string-util';

describe('string-util', () => {
  describe('fromUpperSnakeCase', () => {
    it('should format TRAINED to Trained', () => {
      expect(fromUpperSnakeCase('TRAINED')).toBe('Trained');
    });

    it('should format NOT_TRAINED to Not Trained', () => {
      expect(fromUpperSnakeCase('NOT_TRAINED')).toBe('Not Trained');
    });

    it('should format DELETED to Deleted', () => {
      expect(fromUpperSnakeCase('DELETED')).toBe('Deleted');
    });

    it('should format PENDING to Pending', () => {
      expect(fromUpperSnakeCase('PENDING')).toBe('Pending');
    });

    it('should format ACTIVE to Active', () => {
      expect(fromUpperSnakeCase('ACTIVE')).toBe('Active');
    });

    it('should handle already lowercase text', () => {
      expect(fromUpperSnakeCase('trained')).toBe('Trained');
    });

    it('should handle mixed case text', () => {
      expect(fromUpperSnakeCase('NoT_tRaInEd')).toBe('Not Trained');
    });

    it('should handle empty string', () => {
      expect(fromUpperSnakeCase('')).toBe('');
    });

    it('should handle single word', () => {
      expect(fromUpperSnakeCase('SINGLE')).toBe('Single');
    });

    it('should handle multiple underscores', () => {
      expect(fromUpperSnakeCase('MULTIPLE_UNDERSCORES_HERE')).toBe('Multiple Underscores Here');
    });

    it('should format other variable types', () => {
      expect(fromUpperSnakeCase('USER_ROLE')).toBe('User Role');
      expect(fromUpperSnakeCase('API_ENDPOINT')).toBe('Api Endpoint');
      expect(fromUpperSnakeCase('DATABASE_CONNECTION')).toBe('Database Connection');
    });
  });

  describe('isTemplate', () => {
    it('should return true for valid template', () => {
      expect(isTemplate('${variable}')).toBe(true);
    });

    it('should return false for non-template string', () => {
      expect(isTemplate('variable')).toBe(false);
    });

    it('should return false for partial template', () => {
      expect(isTemplate('${variable')).toBe(false);
    });
  });

  describe('stringToTemplate', () => {
    it('should convert string to template', () => {
      expect(stringToTemplate('variable')).toBe('${variable}');
    });

    it('should handle empty string', () => {
      expect(stringToTemplate('')).toBe('${""}');
    });
  });

  describe('templateToString', () => {
    it('should convert template to string', () => {
      expect(templateToString('${variable}')).toBe('variable');
    });

    it('should handle non-template input', () => {
      expect(templateToString('variable')).toBe('variable');
    });
  });

  describe('toSnakeCase', () => {
    it('should convert spaces to underscores', () => {
      expect(toSnakeCase('hello world')).toBe('hello_world');
    });

    it('should convert hyphens to underscores', () => {
      expect(toSnakeCase('hello-world')).toBe('hello_world');
    });

    it('should handle multiple spaces', () => {
      expect(toSnakeCase('hello   world')).toBe('hello_world');
    });
  });

  describe('fromSnakeCase', () => {
    it('should convert snake case to title case', () => {
      expect(fromSnakeCase('hello_world')).toBe('Hello World');
    });

    it('should handle numbers at the end', () => {
      expect(fromSnakeCase('send_message_1')).toBe('Send message - 1');
    });

    it('should handle single word', () => {
      expect(fromSnakeCase('hello')).toBe('Hello');
    });
  });

  describe('getLastDigits', () => {
    it('should extract last digits', () => {
      expect(getLastDigits('test123')).toBe(123);
    });

    it('should return 1 for no digits', () => {
      expect(getLastDigits('test')).toBe(1);
    });

    it('should handle only digits', () => {
      expect(getLastDigits('123')).toBe(123);
    });
  });

  describe('removeTrailingUnderscores', () => {
    it('should remove trailing underscores', () => {
      expect(removeTrailingUnderscores('test___')).toBe('test');
    });

    it('should handle no trailing underscores', () => {
      expect(removeTrailingUnderscores('test')).toBe('test');
    });
  });

  describe('stringToArray', () => {
    it('should convert valid JSON array string', () => {
      expect(stringToArray('["a", "b"]')).toEqual(['a', 'b']);
    });

    it('should return fallback for invalid JSON', () => {
      expect(stringToArray('invalid')).toEqual([]);
    });

    it('should return fallback for empty string', () => {
      expect(stringToArray('')).toEqual([]);
    });
  });

  describe('removeNestedTemplates', () => {
    it('should remove nested templates', () => {
      expect(removeNestedTemplates('${${inner}outer}')).toBe('${innerouter}');
    });

    it('should handle no nested templates', () => {
      expect(removeNestedTemplates('${simple}')).toBe('${simple}');
    });
  });
});
