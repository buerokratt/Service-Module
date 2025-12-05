import JSONEditor from 'jsoneditor';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'jsoneditor/dist/jsoneditor.css';
import './json.scss';
import { getDragData } from 'utils/component-util';
import { searchForProperty, searchForValue, updateValueAtPath } from 'utils/object-util';
import { stringToEscapedTemplate } from 'utils/string-util';

import styles from './ObjectEditor.module.scss';

// Helper function to find the path to a node in the JSON structure
const findNodePath = (node: Element, data: Record<string, unknown>): string | null => {
  // Try to find by text content (for values)
  const textContent = node.textContent?.trim();
  if (textContent) {
    const path = searchForValue(data, textContent);
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
          onChange(stringToEscapedTemplate(JSON.stringify(jsonEditorRef.current?.get())));
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
    // Dependencies array is intentionally empty - JSONEditor manages its own state
    // so no need to re-render the component when the data changes
    // Adding dependencies would cause inputs in JSONEditor to lose focus on typing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if (jsonEditorRef.current) {
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

              onChange(stringToEscapedTemplate(JSON.stringify(newData)));
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
