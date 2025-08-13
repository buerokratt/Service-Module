import React, { useEffect, useRef, useState } from "react";
import { createJSONEditor, type Content } from "vanilla-jsoneditor";
import { useTranslation } from "react-i18next";
import { Track } from "components";
import "../styles.scss";

interface JsonEditorPoCProps {
  initialValue?: any;
  onChange?: (value: any) => void;
  readOnly?: boolean;
}

const JsonEditorPoC: React.FC<JsonEditorPoCProps> = ({ initialValue = {}, onChange, readOnly = false }) => {
  const { t } = useTranslation();
  const editorRef = useRef<HTMLDivElement>(null);
  const jsonEditorRef = useRef<any>(null);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editorRef.current && !jsonEditorRef.current) {
      // Initialize the JSON editor using the correct API
      jsonEditorRef.current = createJSONEditor({
        target: editorRef.current,
        props: {
          content: { json: initialValue },
          readOnly,
          onChange: (newContent: Content) => {
            try {
              // Handle different content formats from vanilla-jsoneditor
              let jsonValue: any;
              if ("json" in newContent) {
                jsonValue = newContent.json;
              } else if ("text" in newContent) {
                jsonValue = JSON.parse(newContent.text);
              } else {
                jsonValue = newContent;
              }

              setIsValid(true);
              setError(null);
              onChange?.(jsonValue);
            } catch (err) {
              setIsValid(false);
              setError(err instanceof Error ? err.message : "Invalid JSON");
            }
          },
          mode: "tree",
          navigationBar: true,
          statusBar: true,
          colorPicker: true,
          search: true,
          height: "400px",
        },
      });
    }

    return () => {
      if (jsonEditorRef.current) {
        jsonEditorRef.current.destroy();
        jsonEditorRef.current = null;
      }
    };
  }, [initialValue, readOnly, onChange]);

  // Update editor value when initialValue changes
  useEffect(() => {
    if (jsonEditorRef.current) {
      jsonEditorRef.current.set({ json: initialValue });
    }
  }, [initialValue]);

  return (
    <Track gap={16} direction="vertical" align="stretch">
      <div>
        <h4>JSON Editor PoC</h4>
        {!isValid && error && <div style={{ color: "red", fontSize: "12px" }}>{error}</div>}
      </div>

      <div
        ref={editorRef}
        style={{
          border: !isValid ? "2px solid red" : "1px solid #ccc",
          borderRadius: "4px",
          minHeight: "400px",
        }}
      />
    </Track>
  );
};

export default JsonEditorPoC;
