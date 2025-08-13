import React, { useEffect, useRef, useState } from "react";
// @ts-ignore
import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";
import { getDragData } from "utils/component-util";

const JsonEditorPoC: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const jsonEditorRef = useRef<JSONEditor | null>(null);
  const [data, setData] = useState({
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
  });

  useEffect(() => {
    if (editorRef.current && !jsonEditorRef.current) {
      const editor = new JSONEditor(editorRef.current, {
        mode: "tree",
        modes: ["tree", "view", "form", "text", "code"],
        onChangeJSON: (json: any) => {
          console.log("JSON changed:", json);
          setData(json);
        },
        onError: (error: any) => {
          console.error("JSON Editor error:", error);
        },
        enableSort: true,
        enableTransform: true,
        search: true,
        enableClipboard: true,
        enableHistory: false,
        enableNavigationBar: false,
        enableStatusBar: false,
        indentation: 2,
        escapeUnicode: false,
        sortObjectKeys: false,
        colorPicker: true,
        timestampTag: true,
        language: "en",
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    try {
      const dragData = getDragData(e);
      if (dragData && jsonEditorRef.current) {
        // Extract just the value from the drag data
        const valueToReplace = dragData.value || dragData.data || dragData;
        
        // Get the element under the cursor
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (element) {
          // Find the closest JSON editor node
          const jsonNode = element.closest('.jsoneditor-value, .jsoneditor-field, .jsoneditor-string, .jsoneditor-number, .jsoneditor-boolean');
          
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

  // Helper function to find the path to a node in the JSON structure
  const findNodePath = (node: Element, data: any): string | null => {
    // This is a simplified approach - you might need to enhance this
    // based on the actual DOM structure of jsoneditor
    
    // Look for data attributes or other identifiers
    const fieldElement = node.closest('[data-path]');
    if (fieldElement) {
      return fieldElement.getAttribute('data-path');
    }
    
    // Fallback: try to find by text content
    const textContent = node.textContent?.trim();
    if (textContent) {
      return findPathByValue(data, textContent);
    }
    
    return null;
  };

  // Helper function to find path by value
  const findPathByValue = (obj: any, value: string, currentPath = ''): string | null => {
    for (const key in obj) {
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      
      if (obj[key] === value) {
        return newPath;
      }
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const result = findPathByValue(obj[key], value, newPath);
        if (result) return result;
      }
    }
    return null;
  };

  // Helper function to update value at a specific path
  const updateValueAtPath = (obj: any, path: string, newValue: any): any => {
    const pathParts = path.split('.');
    const newObj = { ...obj };
    let current = newObj;
    
    // Navigate to the parent of the target
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (current[pathParts[i]] === undefined) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    
    // Update the value at the target path
    const lastPart = pathParts[pathParts.length - 1];
    current[lastPart] = newValue;
    
    return newObj;
  };

    return (
    <div
      ref={editorRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        height: "400px",
        border: "1px solid #ddd",
        borderRadius: "4px",
      }}
    />
  );
};

export default JsonEditorPoC;
