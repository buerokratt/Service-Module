import { describe, expect, it } from 'vitest';

import { buildPath, isStringValueMatch, searchForProperty } from './object-util';

describe('Object Utils', () => {
  describe('buildPath', () => {
    it('should build array paths correctly', () => {
      // Test array index paths
      expect(buildPath('', 0)).toBe('[0]');
      expect(buildPath('', 1)).toBe('[1]');
      expect(buildPath('', 42)).toBe('[42]');
    });

    it('should build object paths correctly', () => {
      // Test object key paths
      expect(buildPath('', 'prop1')).toBe('prop1');
      expect(buildPath('', 'nestedProperty')).toBe('nestedProperty');
      expect(buildPath('', 'camelCase')).toBe('camelCase');
    });

    it('should build nested array paths correctly', () => {
      // Test array paths with existing currentPath
      expect(buildPath('root', 0)).toBe('root[0]');
      expect(buildPath('parent.child', 1)).toBe('parent.child[1]');
      expect(buildPath('level1.level2', 42)).toBe('level1.level2[42]');
    });

    it('should build nested object paths correctly', () => {
      // Test object paths with existing currentPath
      expect(buildPath('root', 'prop1')).toBe('root.prop1');
      expect(buildPath('parent.child', 'nestedProp')).toBe('parent.child.nestedProp');
      expect(buildPath('level1.level2', 'deepProp')).toBe('level1.level2.deepProp');
    });

    it('should handle mixed path types correctly', () => {
      // Test mixed array and object paths
      expect(buildPath('root.prop', 0)).toBe('root.prop[0]');
      expect(buildPath('parent[0]', 'child')).toBe('parent[0].child');
      expect(buildPath('level1[0].level2', 1)).toBe('level1[0].level2[1]');
    });

    it('should handle edge cases', () => {
      // Test edge cases
      expect(buildPath('', 0)).toBe('[0]');
      expect(buildPath('', '')).toBe('');
      expect(buildPath('', '0')).toBe('0'); // String '0' vs number 0
    });
  });

  describe('searchForProperty', () => {
    it('should find properties in simple objects', () => {
      const data = { prop1: 'value1', prop2: 'value2' };

      expect(searchForProperty(data, 'prop1')).toBe('prop1');
      expect(searchForProperty(data, 'prop2')).toBe('prop2');
      expect(searchForProperty(data, 'nonexistent')).toBe(null);
    });

    it('should find properties in nested objects', () => {
      const data = {
        level1: {
          level2: {
            targetProp: 'found',
          },
        },
      };

      expect(searchForProperty(data, 'targetProp')).toBe('level1.level2.targetProp');
      expect(searchForProperty(data, 'level1')).toBe('level1');
    });

    it('should find properties in arrays', () => {
      const data = [{ name: 'item1' }, { name: 'item2' }];

      expect(searchForProperty(data, 'name')).toBe('[0].name');
    });

    it('should find properties in mixed structures', () => {
      const data = {
        users: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' },
        ],
        settings: {
          theme: 'dark',
        },
      };

      expect(searchForProperty(data, 'name')).toBe('users[0].name');
      expect(searchForProperty(data, 'theme')).toBe('settings.theme');
      expect(searchForProperty(data, 'id')).toBe('users[0].id');
    });

    it('should handle empty and invalid data', () => {
      expect(searchForProperty(null, 'prop')).toBe(null);
      expect(searchForProperty(undefined, 'prop')).toBe(null);
      expect(searchForProperty('string', 'prop')).toBe(null);
      expect(searchForProperty(42, 'prop')).toBe(null);
    });

    it('should handle empty currentPath correctly', () => {
      const data = { prop: 'value' };

      expect(searchForProperty(data, 'prop')).toBe('prop');
      expect(searchForProperty(data, 'nonexistent')).toBe(null);
    });

    it('should handle nested arrays correctly', () => {
      const data = {
        categories: [
          {
            name: 'tech',
            items: [
              { id: 1, title: 'item1' },
              { id: 2, title: 'item2' },
            ],
          },
        ],
      };

      expect(searchForProperty(data, 'title')).toBe('categories[0].items[0].title');
      expect(searchForProperty(data, 'name')).toBe('categories[0].name');
    });
  });

  describe('isStringValueMatch', () => {
    it('should match exact string values', () => {
      expect(isStringValueMatch('hello', 'hello')).toBe(true);
      expect(isStringValueMatch('test123', 'test123')).toBe(true);
      expect(isStringValueMatch('', '')).toBe(true);
      expect(isStringValueMatch('hello', 'world')).toBe(false);
    });

    it('should match number values', () => {
      expect(isStringValueMatch(42, '42')).toBe(true);
      expect(isStringValueMatch(0, '0')).toBe(true);
      expect(isStringValueMatch(-123, '-123')).toBe(true);
      expect(isStringValueMatch(3.14, '3.14')).toBe(true);
      expect(isStringValueMatch(42, '43')).toBe(false);
    });

    it('should match boolean values', () => {
      expect(isStringValueMatch(true, 'true')).toBe(true);
      expect(isStringValueMatch(false, 'false')).toBe(true);
      expect(isStringValueMatch(true, 'false')).toBe(false);
      expect(isStringValueMatch(false, 'true')).toBe(false);
      expect(isStringValueMatch(true, 'TRUE')).toBe(true); // case insensitive
      expect(isStringValueMatch(false, 'FALSE')).toBe(true); // case insensitive
    });

    it('should match null values', () => {
      expect(isStringValueMatch(null, 'null')).toBe(true);
      expect(isStringValueMatch(null, 'NULL')).toBe(true); // case insensitive
      expect(isStringValueMatch(null, 'undefined')).toBe(false);
      expect(isStringValueMatch(undefined, 'null')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isStringValueMatch('0', '0')).toBe(true); // string '0' vs string '0'
      expect(isStringValueMatch(0, '0')).toBe(true); // number 0 vs string '0'
      expect(isStringValueMatch('true', 'true')).toBe(true); // string vs string
      expect(isStringValueMatch('false', 'false')).toBe(true); // string vs string
      expect(isStringValueMatch('null', 'null')).toBe(true); // string vs string
    });

    it('should handle invalid number conversions', () => {
      expect(isStringValueMatch(42, 'not-a-number')).toBe(false);
      expect(isStringValueMatch(0, 'abc')).toBe(false);
      expect(isStringValueMatch(-5, 'xyz')).toBe(false);
    });
  });
});
