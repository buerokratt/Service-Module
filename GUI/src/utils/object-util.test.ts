import { describe, expect, it } from 'vitest';

import {
  buildPath,
  isStringValueMatch,
  parsePath,
  searchForProperty,
  searchForValue,
  updateValueAtPath,
} from './object-util';

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

  describe('searchForValue', () => {
    it('should find string values in simple objects', () => {
      const data = { prop1: 'hello', prop2: 'world' };

      expect(searchForValue(data, 'hello')).toBe('prop1');
      expect(searchForValue(data, 'world')).toBe('prop2');
      expect(searchForValue(data, 'nonexistent')).toBe(null);
    });

    it('should find number values in objects', () => {
      const data = { count: 42, price: 19.99, zero: 0 };

      expect(searchForValue(data, '42')).toBe('count');
      expect(searchForValue(data, '19.99')).toBe('price');
      expect(searchForValue(data, '0')).toBe('zero');
      expect(searchForValue(data, '100')).toBe(null);
    });

    it('should find boolean values in objects', () => {
      const data = { isActive: true, isVisible: false };

      expect(searchForValue(data, 'true')).toBe('isActive');
      expect(searchForValue(data, 'false')).toBe('isVisible');
      expect(searchForValue(data, 'TRUE')).toBe('isActive'); // case insensitive
      expect(searchForValue(data, 'FALSE')).toBe('isVisible'); // case insensitive
    });

    it('should find null values in objects', () => {
      const data = { nullable: null, defined: 'value' };

      expect(searchForValue(data, 'null')).toBe('nullable');
      expect(searchForValue(data, 'NULL')).toBe('nullable'); // case insensitive
      expect(searchForValue(data, 'value')).toBe('defined');
    });

    it('should find values in arrays', () => {
      const data = ['apple', 'banana', 'cherry'];

      expect(searchForValue(data, 'apple')).toBe('[0]');
      expect(searchForValue(data, 'banana')).toBe('[1]');
      expect(searchForValue(data, 'cherry')).toBe('[2]');
      expect(searchForValue(data, 'orange')).toBe(null);
    });

    it('should find values in nested objects', () => {
      const data = {
        level1: {
          level2: {
            target: 'found',
          },
        },
      };

      expect(searchForValue(data, 'found')).toBe('level1.level2.target');
    });

    it('should find values in mixed structures', () => {
      const data = {
        users: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 },
        ],
        settings: {
          theme: 'dark',
          enabled: true,
        },
      };

      expect(searchForValue(data, 'John')).toBe('users[0].name');
      expect(searchForValue(data, '30')).toBe('users[0].age');
      expect(searchForValue(data, 'dark')).toBe('settings.theme');
      expect(searchForValue(data, 'true')).toBe('settings.enabled');
    });

    it('should handle edge cases', () => {
      const data = { empty: '', zero: 0, falsy: false };

      expect(searchForValue(data, '')).toBe('empty');
      expect(searchForValue(data, '0')).toBe('zero');
      expect(searchForValue(data, 'false')).toBe('falsy');
    });

    it('should return first match when duplicates exist', () => {
      const data = {
        first: 'duplicate',
        second: 'duplicate',
        third: 'unique',
      };

      // Should return the first match found
      expect(searchForValue(data, 'duplicate')).toBe('first');
    });
  });

  describe('updateValueAtPath', () => {
    it('should update simple object properties', () => {
      const obj = { name: 'John', age: 30 };
      const result = updateValueAtPath(obj, 'name', 'Jane');

      expect(result).toEqual({ name: 'Jane', age: 30 });
      expect(result).not.toBe(obj); // Should return new object
      expect(obj.name).toBe('John'); // Original should be unchanged
    });

    it('should update nested object properties', () => {
      const obj = {
        user: {
          profile: {
            name: 'John',
            email: 'john@example.com',
          },
        },
      };

      const result = updateValueAtPath(obj, 'user.profile.name', 'Jane') as typeof obj;

      expect(result.user.profile.name).toBe('Jane');
      expect(result.user.profile.email).toBe('john@example.com');
      expect(result).not.toBe(obj);
    });

    it('should update array elements', () => {
      const arr = ['apple', 'banana', 'cherry'];
      const result = updateValueAtPath(arr, '[1]', 'blueberry');

      expect(result).toEqual(['apple', 'blueberry', 'cherry']);
      expect(result).not.toBe(arr);
      expect(arr[1]).toBe('banana'); // Original should be unchanged
    });

    it('should update nested array elements', () => {
      const obj = {
        fruits: [
          { name: 'apple', color: 'red' },
          { name: 'banana', color: 'yellow' },
        ],
      };

      const result = updateValueAtPath(obj, 'fruits[0].color', 'green') as typeof obj;

      expect(result.fruits[0].color).toBe('green');
      expect(result.fruits[1].color).toBe('yellow');
      expect(result).not.toBe(obj);
    });

    it('should create missing object properties', () => {
      const obj = { existing: 'value' };
      const result = updateValueAtPath(obj, 'newProp.nestedProp', 'newValue') as typeof obj & {
        newProp: { nestedProp: string };
      };

      expect(result.newProp.nestedProp).toBe('newValue');
      expect(result.existing).toBe('value');
      expect(result).not.toBe(obj);
    });

    it('should handle root level updates', () => {
      const obj = { prop1: 'value1', prop2: 'value2' };
      const result = updateValueAtPath(obj, 'prop1', 'updated') as typeof obj;

      expect(result.prop1).toBe('updated');
      expect(result.prop2).toBe('value2');
    });

    it('should handle empty paths', () => {
      const obj = { prop: 'value' };
      const result = updateValueAtPath(obj, '', 'newValue');

      // Empty path should not change anything
      expect(result).toEqual(obj);
      expect(result).toBe(obj); // Should return the same object reference
    });

    it('should handle complex nested structures', () => {
      const obj = {
        level1: {
          level2: [
            {
              level3: {
                level4: {
                  target: 'oldValue',
                },
              },
            },
          ],
        },
      };

      const result = updateValueAtPath(obj, 'level1.level2[0].level3.level4.target', 'newValue') as typeof obj;

      expect(result.level1.level2[0].level3.level4.target).toBe('newValue');
      expect(result).not.toBe(obj);
    });

    it('should preserve object structure', () => {
      const obj = {
        nested: {
          deep: {
            value: 'original',
          },
        },
      };

      const result = updateValueAtPath(obj, 'nested.deep.value', 'updated') as typeof obj;

      expect(result.nested.deep.value).toBe('updated');
      expect(result.nested.deep).not.toBe(obj.nested.deep);
      expect(result.nested).not.toBe(obj.nested);
      expect(result).not.toBe(obj);
    });

    it('should handle special characters in property names', () => {
      const obj = { 'special-prop': 'value1', 'another.prop': 'value2' };
      const result = updateValueAtPath(obj, 'special-prop', 'updated') as typeof obj;

      expect(result['special-prop']).toBe('updated');
      expect(result['another.prop']).toBe('value2');
    });
  });

  describe('parsePath', () => {
    it('should parse simple property paths', () => {
      expect(parsePath('property')).toEqual(['property']);
      expect(parsePath('simpleName')).toEqual(['simpleName']);
      expect(parsePath('camelCase')).toEqual(['camelCase']);
    });

    it('should parse dot notation paths', () => {
      expect(parsePath('parent.child')).toEqual(['parent', 'child']);
      expect(parsePath('level1.level2.level3')).toEqual(['level1', 'level2', 'level3']);
      expect(parsePath('user.profile.name')).toEqual(['user', 'profile', 'name']);
    });

    it('should parse array index paths', () => {
      expect(parsePath('[0]')).toEqual([0]);
      expect(parsePath('[42]')).toEqual([42]);
      expect(parsePath('[999]')).toEqual([999]);
    });

    it('should parse property followed by array index', () => {
      expect(parsePath('items[0]')).toEqual(['items', 0]);
      expect(parsePath('users[42]')).toEqual(['users', 42]);
      expect(parsePath('data[999]')).toEqual(['data', 999]);
    });

    it('should parse array index followed by property', () => {
      expect(parsePath('[0].name')).toEqual([0, 'name']);
      expect(parsePath('[42].value')).toEqual([42, 'value']);
      expect(parsePath('[999].property')).toEqual([999, 'property']);
    });

    it('should parse complex mixed paths', () => {
      expect(parsePath('users[0].profile.name')).toEqual(['users', 0, 'profile', 'name']);
      expect(parsePath('data[42].items[7].value')).toEqual(['data', 42, 'items', 7, 'value']);
      expect(parsePath('level1[0].level2[1].level3')).toEqual(['level1', 0, 'level2', 1, 'level3']);
    });

    it('should handle consecutive array indices', () => {
      expect(parsePath('[0][1]')).toEqual([0, 1]);
      expect(parsePath('[42][7]')).toEqual([42, 7]);
      expect(parsePath('items[0][1]')).toEqual(['items', 0, 1]);
    });

    it('should handle empty paths', () => {
      expect(parsePath('')).toEqual([]);
    });

    it('should handle paths with empty segments', () => {
      // parsePath skips empty segments, so these return empty arrays
      expect(parsePath('..')).toEqual([]);
      expect(parsePath('prop..value')).toEqual(['prop', 'value']);
      expect(parsePath('..prop')).toEqual(['prop']);
    });

    it('should handle edge cases', () => {
      expect(parsePath('single')).toEqual(['single']);
      expect(parsePath('a.b.c')).toEqual(['a', 'b', 'c']);
      expect(parsePath('[0].a[1].b')).toEqual([0, 'a', 1, 'b']);
    });

    it('should handle large numbers in array indices', () => {
      expect(parsePath('[123456789]')).toEqual([123456789]);
      expect(parsePath('items[999999]')).toEqual(['items', 999999]);
    });

    it('should handle zero values correctly', () => {
      expect(parsePath('[0]')).toEqual([0]);
      expect(parsePath('items[0]')).toEqual(['items', 0]);
      expect(parsePath('[0].value')).toEqual([0, 'value']);
    });
  });
});
