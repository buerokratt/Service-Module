import React, { useEffect, useRef, useState } from "react";
// @ts-ignore
import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";

const JsonEditorPoC: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const jsonEditorRef = useRef<JSONEditor | null>(null);

  useEffect(() => {
    if (editorRef.current && !jsonEditorRef.current) {
      const editor = new JSONEditor(editorRef.current);

      editor.set({
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
      jsonEditorRef.current = editor;
    }

    return () => {
      if (jsonEditorRef.current) {
        jsonEditorRef.current.destroy();
        jsonEditorRef.current = null;
      }
    };
  }, []);


  return (
    <div
      ref={editorRef}
      style={{
        height: "400px",
        border: "1px solid #ddd",
        borderRadius: "4px",
      }}
    />
  );
};

export default JsonEditorPoC;
