import JSONEditor from 'jsoneditor';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'jsoneditor/dist/jsoneditor.css';
import { getDragData } from 'utils/component-util';
import { isObject, updateValueAtPath } from 'utils/object-util';
import { stringToTemplate } from 'utils/string-util';

import styles from './ObjectEditor.module.scss';

// Helper function to find the path to a node in the JSON structure
const findNodePath = (node: Element, data: Record<string, unknown>): string | null => {
  // Try to find by text content (for values)
  const textContent = node.textContent?.trim();
  if (textContent) {
    const path = searchInCollection(data, textContent);
    return path;
  }

  // If no text content (empty value), try to find by the associated property name
  // Look for the property name in the same table row
  const tableRow = node.closest('tr');
  if (tableRow) {
    const fieldElement = tableRow.querySelector('.jsoneditor-field');
    if (fieldElement) {
      const propertyName = fieldElement.textContent?.trim();
      if (propertyName) {
        // Search for the property name in the data structure
        const path = searchForProperty(data, propertyName);
        return path;
      }
    }
  }

  return null;
};

// Helper function to check if values match (handling different types)
const isValueMatch = (objValue: unknown, value: string): boolean => {
  // Handle boolean conversion
  let booleanValue: boolean | null = null;
  if (value.toLowerCase() === 'true') {
    booleanValue = true;
  } else if (value.toLowerCase() === 'false') {
    booleanValue = false;
  }

  return (
    objValue === value ||
    (typeof objValue === 'number' && !isNaN(Number(value)) && objValue === Number(value)) ||
    (typeof objValue === 'boolean' && objValue === booleanValue) ||
    (objValue === null && value.toLowerCase() === 'null')
  );
};

// Helper function to search for a property name in an array
const searchForPropertyInArray = (array: unknown[], propertyName: string, currentPath = ''): string | null => {
  for (let index = 0; index < array.length; index++) {
    const item = array[index];
    const newPath = currentPath ? `${currentPath}[${index}]` : `[${index}]`;

    if (isObject(item)) {
      const result = searchForProperty(item, propertyName, newPath);
      if (result) return result;
    }
  }
  return null;
};

// Helper function to search for a property name in an object
const searchForPropertyInObject = (
  obj: Record<string, unknown>,
  propertyName: string,
  currentPath = '',
): string | null => {
  // Check if this object has the property
  if (propertyName in obj) {
    return currentPath ? `${currentPath}.${propertyName}` : propertyName;
  }

  // Search deeper in nested objects
  for (const [key, value] of Object.entries(obj)) {
    const newPath = currentPath ? `${currentPath}.${key}` : key;

    if (isObject(value)) {
      const result = searchForProperty(value, propertyName, newPath);
      if (result) return result;
    }
  }

  return null;
};

// Helper function to search for a property name in the data structure
const searchForProperty = (data: unknown, propertyName: string, currentPath = ''): string | null => {
  if (Array.isArray(data)) {
    return searchForPropertyInArray(data, propertyName, currentPath);
  }

  if (isObject(data)) {
    return searchForPropertyInObject(data as Record<string, unknown>, propertyName, currentPath);
  }

  return null;
};

// Helper function to search for value in an array
const searchInArray = (array: unknown[], value: string, currentPath = ''): string | null => {
  for (let index = 0; index < array.length; index++) {
    const objValue = array[index];
    const newPath = currentPath ? `${currentPath}[${index}]` : `[${index}]`;

    if (isValueMatch(objValue, value)) return newPath;

    if (isObject(objValue)) {
      const result = searchInCollection(objValue, value, newPath);
      if (result) return result;
    }
  }

  return null;
};

// Helper function to search for value in an object
const searchInObject = (obj: Record<string, unknown>, value: string, currentPath = ''): string | null => {
  for (const [key, objValue] of Object.entries(obj)) {
    const newPath = currentPath ? `${currentPath}.${key}` : String(key);

    if (isValueMatch(objValue, value)) return newPath;

    if (isObject(objValue)) {
      const result = searchInCollection(objValue, value, newPath);
      if (result) return result;
    }
  }

  return null;
};

// Helper function to search for value in a collection
const searchInCollection = (collection: object, value: string, currentPath = ''): string | null => {
  if (Array.isArray(collection)) {
    return searchInArray(collection, value, currentPath);
  }

  return searchInObject(collection as Record<string, unknown>, value, currentPath);
};

interface ObjectEditorProps {
  onChange: (value: string) => void;
  data: Record<string, unknown> | unknown[];
}

const ObjectEditor: React.FC<ObjectEditorProps> = ({ onChange, data }) => {
  const { t, i18n } = useTranslation();
  const jsonEditor = t('objectEditor', { returnObjects: true });
  const editorRef = useRef<HTMLDivElement>(null);
  const jsonEditorRef = useRef<JSONEditor | null>(null);
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null);

  useEffect(() => {
    if (editorRef.current && !jsonEditorRef.current) {
      const editor = new JSONEditor(editorRef.current, {
        language: i18n.language,
        languages: {
          [i18n.language]: jsonEditor,
        },
        onChange: () => {
          onChange(stringToTemplate(JSON.stringify(jsonEditorRef.current?.get())));
        },
      });

      editor.set(data);
      jsonEditorRef.current = editor;
    }

    return () => {
      if (jsonEditorRef.current) {
        jsonEditorRef.current.destroy();
        jsonEditorRef.current = null;
      }
    };
  }, []);

  // Cleanup effect to remove highlight when component unmounts
  useEffect(() => {
    return () => {
      if (hoveredElement) {
        hoveredElement.classList.remove(styles.dragHoverHighlight);
      }
    };
  }, [hoveredElement]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    // Get the element under the cursor
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (element) {
      const jsonNode = element.closest('.jsoneditor-value');

      // Remove highlight from previously hovered element
      if (hoveredElement && hoveredElement !== jsonNode) {
        hoveredElement.classList.remove(styles.dragHoverHighlight);
      }

      // Add highlight to currently hovered element
      if (jsonNode && jsonNode !== hoveredElement) {
        jsonNode.classList.add(styles.dragHoverHighlight);
        setHoveredElement(jsonNode);
      }
    }
  };

  const handleDragLeave = () => {
    // Remove highlight when leaving the drop zone
    if (hoveredElement) {
      hoveredElement.classList.remove(styles.dragHoverHighlight);
      setHoveredElement(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    // Clean up highlight
    if (hoveredElement) {
      hoveredElement.classList.remove(styles.dragHoverHighlight);
      setHoveredElement(null);
    }

    try {
      const dragData = getDragData(e);
      if (dragData && jsonEditorRef.current) {
        // Extract just the value from the drag data
        const valueToReplace = dragData.value;

        // Get the element under the cursor
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (element) {
          const jsonNode = element.closest('.jsoneditor-value');

          if (jsonNode) {
            // Get the current JSON data
            const currentData = jsonEditorRef.current.get() as Record<string, unknown>;

            // Try to find the path to the dropped node
            const path = findNodePath(jsonNode, currentData);

            if (path) {
              // Update the value at the specific path
              const newData = updateValueAtPath(currentData, path, valueToReplace);

              jsonEditorRef.current.update(newData);

              onChange(stringToTemplate(JSON.stringify(newData)));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing drop:', error);
    }
  };

  return (
    <div
      ref={editorRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={styles.editor}
      role="application"
      aria-label={t('objectEditor.editor')!}
      tabIndex={0}
      onKeyDown={(e) => {
        // Handle keyboard interactions for accessibility
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Focus the editor for keyboard navigation
          editorRef.current?.focus();
        }
      }}
    />
  );
};

export default ObjectEditor;
