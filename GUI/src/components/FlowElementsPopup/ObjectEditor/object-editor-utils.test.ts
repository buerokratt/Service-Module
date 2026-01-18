import { describe, expect, it } from 'vitest';

import { findNodePath } from './object-editor-utils';

describe('object-editor-utils', () => {
  describe('findNodePath', () => {
    it('should find path by text content when node has text content', () => {
      const data = { name: 'John', age: 30 };
      const node = document.createElement('div');
      node.textContent = 'John';

      const path = findNodePath(node, data);
      expect(path).toBe('name');
    });

    it('should find path by text content for nested values', () => {
      const data = {
        user: {
          profile: {
            name: 'Jane',
          },
        },
      };
      const node = document.createElement('div');
      node.textContent = 'Jane';

      const path = findNodePath(node, data);
      expect(path).toBe('user.profile.name');
    });

    it('should find path by text content for array values', () => {
      const data = { items: ['apple', 'banana', 'cherry'] };
      const node = document.createElement('div');
      node.textContent = 'banana';

      const path = findNodePath(node, data);
      expect(path).toBe('items[1]');
    });

    it('should find path by text content for number values', () => {
      const data = { count: 42, price: 19.99 };
      const node = document.createElement('div');
      node.textContent = '42';

      const path = findNodePath(node, data);
      expect(path).toBe('count');
    });

    it('should find path by text content for boolean values', () => {
      const data = { isActive: true, isVisible: false };
      const node = document.createElement('div');
      node.textContent = 'true';

      const path = findNodePath(node, data);
      expect(path).toBe('isActive');
    });

    it('should find path by property name when node has no text content', () => {
      const data = { name: '', age: 30 };
      const tableRow = document.createElement('tr');
      const fieldElement = document.createElement('div');
      fieldElement.className = 'jsoneditor-field';
      fieldElement.textContent = 'name';
      const valueElement = document.createElement('div');
      valueElement.className = 'jsoneditor-value';
      tableRow.appendChild(fieldElement);
      tableRow.appendChild(valueElement);

      const path = findNodePath(valueElement, data);
      expect(path).toBe('name');
    });

    it('should find path by property name for nested properties', () => {
      const data = {
        user: {
          profile: {
            email: '',
          },
        },
      };
      const tableRow = document.createElement('tr');
      const fieldElement = document.createElement('div');
      fieldElement.className = 'jsoneditor-field';
      fieldElement.textContent = 'email';
      const valueElement = document.createElement('div');
      valueElement.className = 'jsoneditor-value';
      tableRow.appendChild(fieldElement);
      tableRow.appendChild(valueElement);

      const path = findNodePath(valueElement, data);
      expect(path).toBe('user.profile.email');
    });

    it('should find path by property name in arrays', () => {
      const data: Record<string, unknown> = [{ name: '' }, { name: 'test' }] as unknown as Record<string, unknown>;
      const tableRow = document.createElement('tr');
      const fieldElement = document.createElement('div');
      fieldElement.className = 'jsoneditor-field';
      fieldElement.textContent = 'name';
      const valueElement = document.createElement('div');
      valueElement.className = 'jsoneditor-value';
      tableRow.appendChild(fieldElement);
      tableRow.appendChild(valueElement);

      const path = findNodePath(valueElement, data);
      expect(path).toBe('[0].name');
    });

    it('should return null when text content does not match any value', () => {
      const data = { name: 'John', age: 30 };
      const node = document.createElement('div');
      node.textContent = 'nonexistent';

      const path = findNodePath(node, data);
      expect(path).toBe(null);
    });

    it('should return null when property name does not exist', () => {
      const data = { name: 'John', age: 30 };
      const tableRow = document.createElement('tr');
      const fieldElement = document.createElement('div');
      fieldElement.className = 'jsoneditor-field';
      fieldElement.textContent = 'nonexistent';
      const valueElement = document.createElement('div');
      valueElement.className = 'jsoneditor-value';
      tableRow.appendChild(fieldElement);
      tableRow.appendChild(valueElement);

      const path = findNodePath(valueElement, data);
      expect(path).toBe(null);
    });

    it('should trim whitespace from text content', () => {
      const data = { name: 'John', age: 30 };
      const node = document.createElement('div');
      node.textContent = '  John  ';

      const path = findNodePath(node, data);
      expect(path).toBe('name');
    });

    it('should trim whitespace from property name', () => {
      const data = { name: '', age: 30 };
      const tableRow = document.createElement('tr');
      const fieldElement = document.createElement('div');
      fieldElement.className = 'jsoneditor-field';
      fieldElement.textContent = '  name  ';
      const valueElement = document.createElement('div');
      valueElement.className = 'jsoneditor-value';
      tableRow.appendChild(fieldElement);
      tableRow.appendChild(valueElement);

      const path = findNodePath(valueElement, data);
      expect(path).toBe('name');
    });

    it('should prefer text content over property name when both are available', () => {
      const data = { name: 'John', age: 30 };
      const tableRow = document.createElement('tr');
      const fieldElement = document.createElement('div');
      fieldElement.className = 'jsoneditor-field';
      fieldElement.textContent = 'age';
      const valueElement = document.createElement('div');
      valueElement.className = 'jsoneditor-value';
      valueElement.textContent = 'John';
      tableRow.appendChild(fieldElement);
      tableRow.appendChild(valueElement);

      const path = findNodePath(valueElement, data);
      expect(path).toBe('name');
    });
  });
});
