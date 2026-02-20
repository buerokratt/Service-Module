import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ASSIGN_DRAG_TYPE } from 'utils/component-util';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ObjectEditor from './ObjectEditor';
import styles from './ObjectEditor.module.scss';

// Helper to create drag events (DragEvent is not available in jsdom)
const createDragEvent = (type: string, options: { clientX?: number; clientY?: number } = {}) => {
  const event = document.createEvent('Event') as any;
  event.initEvent(type, true, true);
  event.clientX = options.clientX ?? 0;
  event.clientY = options.clientY ?? 0;
  event.dataTransfer = {
    getData: vi.fn(),
  };
  event.preventDefault = vi.fn();
  return event;
};

// Mock JSONEditor
const mockSet = vi.fn();
const mockGet = vi.fn();
const mockUpdate = vi.fn();
const mockDestroy = vi.fn();
let onChangeCallback: (() => void) | undefined;

vi.mock('jsoneditor', () => {
  const mockJSONEditorConstructor = vi.fn().mockImplementation((_: HTMLElement, options: any) => {
    if (options?.onChange) {
      onChangeCallback = options.onChange;
    }
    return {
      set: mockSet,
      get: mockGet,
      update: mockUpdate,
      destroy: mockDestroy,
    };
  });

  return {
    default: mockJSONEditorConstructor,
  };
});

// Mock the translation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { returnObjects?: boolean }) => {
      if (options?.returnObjects && key === 'objectEditor') {
        return {
          array: 'Array',
          auto: 'Auto',
          editor: 'JSON Editor',
        };
      }
      return key;
    },
    i18n: {
      language: 'en',
    },
  }),
}));

describe('ObjectEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue({});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the editor with data on mount', () => {
    const onChange = vi.fn();
    const data = { name: 'John', age: 30 };

    render(<ObjectEditor onChange={onChange} data={data} />);

    const editor = screen.getByRole('application', { name: 'objectEditor.editor' });

    expect(editor).toBeInTheDocument();
    expect(mockSet).toHaveBeenCalledWith(data);
  });

  it('should call onChange when JSONEditor content changes', async () => {
    const onChange = vi.fn();
    const data = { name: 'John', age: 30 };
    const updatedData = { name: 'Jane', age: 30 };

    mockGet.mockReturnValue(updatedData);

    render(<ObjectEditor onChange={onChange} data={data} />);

    // Simulate JSONEditor onChange
    if (onChangeCallback) {
      onChangeCallback();
    }

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    // NB! Checks for ESCAPED template string
    expect(onChange).toHaveBeenCalledWith('$= {"name":"Jane","age":30} =');
  });

  it('should handle drag over event and highlight element', () => {
    const onChange = vi.fn();
    const data = { name: 'John', age: 30 };

    render(<ObjectEditor onChange={onChange} data={data} />);

    const editor = screen.getByRole('application');

    // Create a mock element structure
    const jsonValue = document.createElement('div');
    jsonValue.className = 'jsoneditor-value';
    jsonValue.textContent = 'John';
    editor.appendChild(jsonValue);

    // Mock elementFromPoint to return our element
    const originalElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = vi.fn().mockReturnValue(jsonValue);

    const dragEvent = createDragEvent('dragover', { clientX: 100, clientY: 100 });

    fireEvent(editor, dragEvent as Event);

    // Check if the CSS module class is applied (the actual class name from styles object)
    expect(jsonValue.classList.contains(styles.dragHoverHighlight)).toBe(true);

    // Restore
    document.elementFromPoint = originalElementFromPoint;
  });

  it('should handle drag leave event and remove highlight', () => {
    const onChange = vi.fn();
    const data = { name: 'John', age: 30 };

    render(<ObjectEditor onChange={onChange} data={data} />);

    const editor = screen.getByRole('application');

    // First, set up a hovered element by triggering drag over
    const jsonValue = document.createElement('div');
    jsonValue.className = 'jsoneditor-value';
    jsonValue.textContent = 'John';
    editor.appendChild(jsonValue);

    const originalElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = vi.fn().mockReturnValue(jsonValue);

    // Trigger drag over to set hovered element
    const dragOverEvent = createDragEvent('dragover', { clientX: 100, clientY: 100 });
    fireEvent(editor, dragOverEvent as Event);

    // Verify highlight was added
    expect(jsonValue.classList.contains(styles.dragHoverHighlight)).toBe(true);

    // Now trigger drag leave
    const dragLeaveEvent = createDragEvent('dragleave');
    fireEvent(editor, dragLeaveEvent as Event);

    // Verify highlight was removed
    expect(jsonValue.classList.contains(styles.dragHoverHighlight)).toBe(false);

    // Restore
    document.elementFromPoint = originalElementFromPoint;
  });

  it('should handle drop event and update value at path', () => {
    const onChange = vi.fn();
    const data = { name: 'John', age: 30 };
    const updatedData = { name: 'Jane', age: 30 };

    mockGet.mockReturnValue(data);

    render(<ObjectEditor onChange={onChange} data={data} />);

    const editor = screen.getByRole('application');

    // Create a mock element structure with table row
    const tableRow = document.createElement('tr');
    const fieldElement = document.createElement('div');
    fieldElement.className = 'jsoneditor-field';
    fieldElement.textContent = 'name';
    const jsonValue = document.createElement('div');
    jsonValue.className = 'jsoneditor-value';
    jsonValue.textContent = 'John';
    tableRow.appendChild(fieldElement);
    tableRow.appendChild(jsonValue);
    editor.appendChild(tableRow);

    // Mock elementFromPoint to return our element
    const originalElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = vi.fn().mockReturnValue(jsonValue);

    const dropEvent = createDragEvent('drop', { clientX: 100, clientY: 100 });
    dropEvent.dataTransfer.getData = vi.fn((type: string) => {
      if (type === ASSIGN_DRAG_TYPE) {
        return JSON.stringify({ value: 'Jane' });
      }
      return '';
    });

    // Mock updateValueAtPath result
    mockUpdate.mockImplementation(() => {
      mockGet.mockReturnValue(updatedData);
    });

    fireEvent(editor, dropEvent as Event);

    expect(mockUpdate).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith('$= {"name":"Jane","age":30} =');

    // Restore
    document.elementFromPoint = originalElementFromPoint;
  });

  it('should handle drop event with value found by text content', () => {
    const onChange = vi.fn();
    const data = { name: 'John', age: 30 };
    const updatedData = { name: 'Jane', age: 30 };

    mockGet.mockReturnValue(data);

    render(<ObjectEditor onChange={onChange} data={data} />);

    const editor = screen.getByRole('application');

    const jsonValue = document.createElement('div');
    jsonValue.className = 'jsoneditor-value';
    jsonValue.textContent = 'John';
    editor.appendChild(jsonValue);

    const originalElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = vi.fn().mockReturnValue(jsonValue);

    const dropEvent = createDragEvent('drop', { clientX: 100, clientY: 100 });
    dropEvent.dataTransfer.getData = vi.fn((type: string) => {
      if (type === ASSIGN_DRAG_TYPE) {
        return JSON.stringify({ value: 'Jane' });
      }
      return '';
    });

    mockUpdate.mockImplementation(() => {
      mockGet.mockReturnValue(updatedData);
    });

    fireEvent(editor, dropEvent as Event);

    expect(mockUpdate).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith('$= {"name":"Jane","age":30} =');

    document.elementFromPoint = originalElementFromPoint;
  });

  it('should not update when drop path is not found', () => {
    const onChange = vi.fn();
    const data = { name: 'John', age: 30 };

    mockGet.mockReturnValue(data);

    render(<ObjectEditor onChange={onChange} data={data} />);

    const editor = screen.getByRole('application');

    const jsonValue = document.createElement('div');
    jsonValue.className = 'jsoneditor-value';
    jsonValue.textContent = 'nonexistent';
    editor.appendChild(jsonValue);

    const originalElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = vi.fn().mockReturnValue(jsonValue);

    const dropEvent = createDragEvent('drop', { clientX: 100, clientY: 100 });
    dropEvent.dataTransfer.getData = vi.fn((type: string) => {
      if (type === ASSIGN_DRAG_TYPE) {
        return JSON.stringify({ value: 'Jane' });
      }
      return '';
    });

    fireEvent(editor, dropEvent as Event);

    expect(mockUpdate).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();

    document.elementFromPoint = originalElementFromPoint;
  });

  it('should clean up JSONEditor on unmount', () => {
    const onChange = vi.fn();
    const data = { name: 'John', age: 30 };

    const { unmount } = render(<ObjectEditor onChange={onChange} data={data} />);

    unmount();

    expect(mockDestroy).toHaveBeenCalled();
  });

  it('should handle array data', () => {
    const onChange = vi.fn();
    const data = ['apple', 'banana', 'cherry'];

    render(<ObjectEditor onChange={onChange} data={data} />);

    expect(mockSet).toHaveBeenCalledWith(data);
  });

  it('should handle empty data', () => {
    const onChange = vi.fn();
    const data = {};

    render(<ObjectEditor onChange={onChange} data={data} />);

    expect(mockSet).toHaveBeenCalledWith(data);
  });

  it('should allow entering object keys and values with spaces', async () => {
    const onChange = vi.fn();
    const data = {};
    const dataWithSpaces = { 'key with space': 'value with space', 'another key': 'another value' };

    mockGet.mockReturnValue(dataWithSpaces);

    render(<ObjectEditor onChange={onChange} data={data} />);

    const editor = screen.getByRole('application');

    // Simulate pressing space key - should not prevent default
    const spaceKeyEvent = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(spaceKeyEvent, 'preventDefault');

    fireEvent(editor, spaceKeyEvent);

    // Verify that preventDefault was NOT called (spaces should be allowed)
    expect(preventDefaultSpy).not.toHaveBeenCalled();

    // Verify that data with spaces in keys and values can be handled
    if (onChangeCallback) {
      onChangeCallback();
    }

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    // Verify the onChange was called with the escaped template containing spaces
    expect(onChange).toHaveBeenCalledWith('$= {"key with space":"value with space","another key":"another value"} =');
  });
});
