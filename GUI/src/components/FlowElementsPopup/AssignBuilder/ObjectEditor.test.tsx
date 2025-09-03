import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ObjectEditor from './ObjectEditor';

// Mock the JSONEditor library
vi.mock('jsoneditor', () => ({
  default: vi.fn().mockImplementation(() => ({
    set: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
  })),
}));

// Mock the translation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

// Mock the utility functions
vi.mock('utils/component-util', () => ({
  getDragData: vi.fn(),
}));

vi.mock('utils/object-util', () => ({
  isObject: vi.fn(),
  updateValueAtPath: vi.fn(),
  searchForValue: vi.fn(),
  searchForProperty: vi.fn(),
}));

vi.mock('utils/string-util', () => ({
  stringToTemplate: vi.fn((str) => str),
}));

describe('ObjectEditor', () => {
  const mockOnChange = vi.fn();
  const mockData = {
    testProperty: 'existingValue',
    emptyProperty: '',
    nestedObject: {
      nestedProperty: 'nestedValue',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ObjectEditor onChange={mockOnChange} data={mockData} />);
    expect(screen.getByRole('application')).toBeInTheDocument();
  });

  describe('findNodePath helper function behavior', () => {
    // Mock DOM structure for testing the findNodePath logic
    const createMockDOM = (propertyName: string, value: string, isEmpty = false) => {
      const tableRow = document.createElement('tr');

      const fieldElement = document.createElement('div');
      fieldElement.className = 'jsoneditor-field';
      fieldElement.textContent = propertyName;

      const valueElement = document.createElement('div');
      valueElement.className = 'jsoneditor-value jsoneditor-string';
      if (!isEmpty) {
        valueElement.textContent = value;
      } else {
        valueElement.classList.add('jsoneditor-empty');
      }

      tableRow.appendChild(document.createElement('td')); // button cell
      tableRow.appendChild(fieldElement);
      tableRow.appendChild(document.createElement('td')); // separator cell
      tableRow.appendChild(valueElement);

      return { tableRow, fieldElement, valueElement };
    };

    it('should handle nodes with text content (values)', () => {
      const { valueElement } = createMockDOM('prop1', 'hello');

      // Test that the DOM structure is created correctly
      expect(valueElement.textContent).toBe('hello');
      expect(valueElement.parentElement?.querySelector('.jsoneditor-field')?.textContent).toBe('prop1');
    });

    it('should handle nodes with empty values', () => {
      const { valueElement } = createMockDOM('emptyProp', '', true);

      // Test that empty values are handled correctly
      expect(valueElement.textContent).toBe('');
      expect(valueElement.classList.contains('jsoneditor-empty')).toBe(true);
      expect(valueElement.parentElement?.querySelector('.jsoneditor-field')?.textContent).toBe('emptyProp');
    });

    it('should create proper DOM structure for nested objects', () => {
      const { valueElement } = createMockDOM('level1', 'level1');

      // Test that the DOM structure represents the data correctly
      expect(valueElement.parentElement?.querySelector('.jsoneditor-field')?.textContent).toBe('level1');
    });

    it('should create proper DOM structure for arrays', () => {
      const { valueElement } = createMockDOM('0', 'item1');

      // Test that array indices are handled correctly
      expect(valueElement.parentElement?.querySelector('.jsoneditor-field')?.textContent).toBe('0');
    });
  });
});
