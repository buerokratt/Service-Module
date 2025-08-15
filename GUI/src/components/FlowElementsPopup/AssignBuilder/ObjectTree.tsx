import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";
import { getDragData } from "utils/component-util";
import { isObject, updateValueAtPath } from "utils/object-util";
import styles from "./ObjectTree.module.scss";

// Helper function to find the path to a node in the JSON structure
const findNodePath = (node: Element, data: Record<string, unknown>): string | null => {
  // Try to find by text content (for values)
  const textContent = node.textContent?.trim();
  if (textContent) {
    const path = searchInCollection(data, textContent);
    return path;
  }

  return null;
};

// Helper function to check if values match (handling different types)
const isValueMatch = (objValue: unknown, value: string): boolean => {
  return (
    objValue === value ||
    (typeof objValue === "number" && !isNaN(Number(value)) && objValue === Number(value)) ||
    (typeof objValue === "boolean" &&
      objValue === (value.toLowerCase() === "true" ? true : value.toLowerCase() === "false" ? false : null)) ||
    (objValue === null && value.toLowerCase() === "null")
  );
};

// Helper function to search for value in a collection
const searchInCollection = (collection: object, value: string, currentPath = ""): string | null => {
  const isArray = Array.isArray(collection);

  const entries = isArray
    ? collection.map((value, index) => ({ key: index, value }))
    : Object.entries(collection).map(([key, value]) => ({ key, value }));

  for (const { key, value: objValue } of entries) {
    const newPath = currentPath
      ? isArray
        ? `${currentPath}[${key}]`
        : `${currentPath}.${key}`
      : isArray
        ? `[${key}]`
        : String(key);

    if (isValueMatch(objValue, value)) return newPath;

    if (isObject(objValue)) {
      const result = searchInCollection(objValue, value, newPath);
      if (result) return result;
    }
  }

  return null;
};

const ObjectTree: React.FC = () => {
  const { t, i18n } = useTranslation();
  const editorRef = useRef<HTMLDivElement>(null);
  const jsonEditorRef = useRef<JSONEditor | null>(null);
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null);

  const jsonEditor = t("jsonEditor", { returnObjects: true });
  const [data, setData] = useState<Record<string, unknown> | unknown[]>({
    name: "John Doe",
    age: 30,
    email: "john@example.com",
    address: {
      street: "123 Main St",
      city: "Anytown",
      zip: "12345",
    },
    preferences: {
      theme: "dark",
      notifications: true,
    },
    hobbies: ["reading", "gaming", "coding"],
    scores: [85, 92, { test: "test value" }, 78],
  });

  useEffect(() => {
    if (editorRef.current && !jsonEditorRef.current) {
      const editor = new JSONEditor(editorRef.current, {
        // todo remove?
        modes: ["tree", "code"],
        language: i18n.language,
        languages: {
          [i18n.language]: jsonEditor,
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

  useEffect(() => {
    if (jsonEditorRef.current) {
      jsonEditorRef.current.set(data);
    }
  }, [data]);

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
      const jsonNode = element.closest(".jsoneditor-value");

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
          const jsonNode = element.closest(".jsoneditor-value");

          if (jsonNode) {
            // Get the current JSON data
            const currentData = jsonEditorRef.current.get();

            // Try to find the path to the dropped node
            const path = findNodePath(jsonNode, currentData);

            if (path) {
              // Update the value at the specific path
              const newData = updateValueAtPath(currentData, path, valueToReplace);
              jsonEditorRef.current.set(newData);
              setData(newData);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error processing drop:", error);
    }
  };

  return (
    <div
      ref={editorRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        height: "400px",
        border: "1px solid #ddd",
        borderRadius: "4px",
      }}
    />
  );
};

export default ObjectTree;
