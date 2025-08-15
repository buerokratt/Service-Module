import React, { useEffect, useRef, useState } from "react";
// todo why?
// @ts-ignore
import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";
import { getDragData } from "utils/component-util";
import styles from "./ObjectTree.module.scss";

// todo remove logs
// Helper function to find the path to a node in the JSON structure
const findNodePath = (node: Element, data: Record<string, unknown>): string | null => {
  // Try to find by text content (for values)
  const textContent = node.textContent?.trim();
  if (textContent) {
    const path = findPathByValue(data, textContent);
    return path;
  }

  return null;
};

// Helper function to find path by value
const findPathByValue = (obj: Record<string, unknown> | unknown[], value: string, currentPath = ""): string | null => {
  // Handle arrays
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const newPath = currentPath ? `${currentPath}[${i}]` : `[${i}]`;
      const objValue = obj[i];

      // Check if values match (handling different types)
      const isMatch =
        objValue === value ||
        (typeof objValue === "number" && !isNaN(Number(value)) && objValue === Number(value)) ||
        (typeof objValue === "boolean" &&
          objValue === (value.toLowerCase() === "true" ? true : value.toLowerCase() === "false" ? false : null)) ||
        (objValue === null && value.toLowerCase() === "null");

      if (isMatch) {
        return newPath;
      }

      // Recursively search in nested objects/arrays
      if (typeof objValue === "object" && objValue !== null) {
        const result = findPathByValue(objValue as Record<string, unknown> | unknown[], value, newPath);
        if (result) return result;
      }
    }
    return null;
  }

  // Handle objects
  for (const key in obj) {
    const newPath = currentPath ? `${currentPath}.${key}` : key;
    const objValue = obj[key];

    // Check if values match (handling different types)
    const isMatch =
      objValue === value ||
      (typeof objValue === "number" && !isNaN(Number(value)) && objValue === Number(value)) ||
      (typeof objValue === "boolean" &&
        objValue === (value.toLowerCase() === "true" ? true : value.toLowerCase() === "false" ? false : null)) ||
      (objValue === null && value.toLowerCase() === "null");

    if (isMatch) {
      return newPath;
    }

    // Recursively search in nested objects/arrays
    if (typeof objValue === "object" && objValue !== null) {
      const result = findPathByValue(objValue as Record<string, unknown> | unknown[], value, newPath);
      if (result) return result;
    }
  }
  return null;
};

// Helper function to update value at a specific path
const updateValueAtPath = (
  obj: Record<string, unknown> | unknown[],
  path: string,
  newValue: unknown
): Record<string, unknown> | unknown[] => {
  // Parse path to handle both dot notation and array indices
  const pathParts: (string | number)[] = [];
  let currentPath = path;

  // Extract array indices and object keys
  while (currentPath.length > 0) {
    // First, check for array index at the beginning
    const arrayMatch = currentPath.match(/^\[(\d+)\]/);
    if (arrayMatch) {
      pathParts.push(parseInt(arrayMatch[1]));
      currentPath = currentPath.substring(arrayMatch[0].length);
      continue;
    }

    // Then check for property name followed by array index
    const propertyArrayMatch = currentPath.match(/^([^.\[\]]+)\[(\d+)\]/);
    if (propertyArrayMatch) {
      pathParts.push(propertyArrayMatch[1]); // property name
      pathParts.push(parseInt(propertyArrayMatch[2])); // array index
      currentPath = currentPath.substring(propertyArrayMatch[0].length);
      continue;
    }

    // Check for dot notation
    const dotIndex = currentPath.indexOf(".");
    if (dotIndex === -1) {
      pathParts.push(currentPath);
      break;
    } else {
      pathParts.push(currentPath.substring(0, dotIndex));
      currentPath = currentPath.substring(dotIndex + 1);
    }
  }

  const newObj = Array.isArray(obj) ? [...obj] : { ...obj };
  let current: Record<string, unknown> | unknown[] = newObj;

  // Navigate to the parent of the target
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    if (typeof part === "number") {
      // Array index
      if (Array.isArray(current)) {
        if (current[part] === undefined) {
          current[part] = {};
        }
        current = current[part] as Record<string, unknown> | unknown[];
      } else {
        // Convert object to array if needed
        (current as Record<string, unknown>)[part.toString()] = {};
        current = (current as Record<string, unknown>)[part.toString()] as Record<string, unknown> | unknown[];
      }
    } else {
      // Object key
      if (!Array.isArray(current)) {
        if (current[part] === undefined) {
          current[part] = {};
        }
        current = current[part] as Record<string, unknown> | unknown[];
      } else {
        // This shouldn't happen with proper path parsing, but handle it gracefully
        break;
      }
    }
  }

  // Update the value at the target path
  const lastPart = pathParts[pathParts.length - 1];

  if (typeof lastPart === "number") {
    // Array index
    if (Array.isArray(current)) {
      const originalValue = current[lastPart];
      current[lastPart] = convertValueToMatchType(originalValue, newValue);
    }
  } else {
    // Object key
    if (!Array.isArray(current)) {
      const originalValue = current[lastPart];
      current[lastPart] = convertValueToMatchType(originalValue, newValue);
    }
  }

  return newObj;
};

// Helper function to convert value to match the original type
const convertValueToMatchType = (originalValue: unknown, newValue: unknown): unknown => {
  if (originalValue === undefined) {
    return newValue;
  }

  // Convert newValue to match the original type
  if (typeof originalValue === "number" && typeof newValue === "string") {
    const numValue = Number(newValue);
    if (!isNaN(numValue)) {
      return numValue;
    } else {
      return newValue; // Keep as string if conversion fails
    }
  } else if (typeof originalValue === "boolean" && typeof newValue === "string") {
    if (newValue.toLowerCase() === "true") {
      return true;
    } else if (newValue.toLowerCase() === "false") {
      return false;
    } else {
      return newValue; // Keep as string if conversion fails
    }
  } else {
    return newValue;
  }
};

const ObjectTree: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const jsonEditorRef = useRef<JSONEditor | null>(null);
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null);
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
    hobbies: ["reading", "gaming", "coding"],
    scores: [85, 92, 78],
  });

  useEffect(() => {
    if (editorRef.current && !jsonEditorRef.current) {
      const editor = new JSONEditor(editorRef.current, {
        modes: ["tree", "code"],
        language: "et",
        languages: {
          et: {
            array: "Massiiv",
            auto: "Automaatne",
            appendText: "Lisa lõppu",
            appendTitle: "Lisa uus väli tüübiga 'auto' selle välja järele (Ctrl+Shift+Ins)",
            appendSubmenuTitle: "Vali lisatava välja tüüp",
            appendTitleAuto: "Lisa uus väli tüübiga 'auto' (Ctrl+Shift+Ins)",
            ascending: "Kasvav",
            ascendingTitle: "Sorteeri selle ${type} alamvälju kasvavas järjekorras",
            actionsMenu: "Klõpsa tegevuste menüü avamiseks (Ctrl+M)",
            cannotParseFieldError: "Ei saa välja JSON-iks teisendada",
            cannotParseValueError: "Ei saa väärtust JSON-iks teisendada",
            collapseAll: "Ahenda kõik väljad",
            compactTitle: "Tihenda JSON andmed, eemalda kõik tühikud (Ctrl+Shift+I)",
            descending: "Kahanev",
            descendingTitle: "Sorteeri selle ${type} alamvälju kahanevas järjekorras",
            drag: "Lohista välja liigutamiseks (Alt+Shift+Nooled)",
            duplicateKey: "dubleeritud võti",
            duplicateText: "Dubleeri",
            duplicateTitle: "Dubleeri valitud väljad (Ctrl+D)",
            duplicateField: "Dubleeri see väli (Ctrl+D)",
            duplicateFieldError: "Dubleeritud välja nimi",
            empty: "tühi",
            expandAll: "Laienda kõik väljad",
            expandTitle:
              "Klõpsa välja laiendamiseks/ahendamiseks (Ctrl+E). \n" +
              "Ctrl+Klõps laiendab/ahendab koos kõigi alamväljadega.",
            formatTitle: "Vorminda JSON andmed, korraliku taanduse ja reavahetustega (Ctrl+I)",
            insert: "Lisa",
            insertTitle: "Lisa uus väli tüübiga 'auto' enne seda välja (Ctrl+Ins)",
            insertSub: "Vali lisatava välja tüüp",
            object: "Objekt",
            ok: "Ok",
            redo: "Tee uuesti (Ctrl+Shift+Z)",
            removeText: "Eemalda",
            removeTitle: "Eemalda valitud väljad (Ctrl+Del)",
            removeField: "Eemalda see väli (Ctrl+Del)",
            repairTitle:
              "Paranda JSON: paranda jutumärgid ja paomärgid, eemalda kommentaarid ja JSONP märgendid, teisenda JavaScript objektid JSON-iks.",
            searchTitle: "Otsi välju ja väärtusi",
            searchNextResultTitle: "Järgmine tulemus (Enter)",
            searchPreviousResultTitle: "Eelmine tulemus (Shift + Enter)",
            selectNode: "Vali sõlm...",
            showAll: "näita kõik",
            showMore: "näita rohkem",
            showMoreStatus: "kuvatakse ${visibleChilds} ${totalChilds}-st elemendist.",
            sort: "Sorteeri",
            sortTitle: "Sorteeri selle ${type} alamvälju",
            sortTitleShort: "Sorteeri sisu",
            sortFieldLabel: "Väli:",
            sortDirectionLabel: "Suund:",
            sortFieldTitle: "Vali pesastatud väli, mille järgi massiivi või objekti sorteerida",
            sortAscending: "Kasvav",
            sortAscendingTitle: "Sorteeri valitud väli kasvavas järjekorras",
            sortDescending: "Kahanev",
            sortDescendingTitle: "Sorteeri valitud väli kahanevas järjekorras",
            string: "Sõne",
            transform: "Teisenda",
            transformTitle: "Filtreeri, sorteeri või teisenda selle ${type} alamvälju",
            transformTitleShort: "Filtreeri, sorteeri või teisenda sisu",
            extract: "Eralda",
            extractTitle: "Eralda see ${type}",
            transformQueryTitle: "Sisesta JMESPath päring",
            transformWizardLabel: "Nõustaja",
            transformWizardFilter: "Filter",
            transformWizardSortBy: "Sorteeri",
            transformWizardSelectFields: "Vali väljad",
            transformQueryLabel: "Päring",
            transformPreviewLabel: "Eelvaade",
            type: "Tüüp",
            typeTitle: "Muuda selle välja tüüpi",
            openUrl: "Ctrl+Klõps või Ctrl+Enter URL-i uues aknas avamiseks",
            undo: "Võta viimane tegevus tagasi (Ctrl+Z)",
            validationCannotMove: "Välja ei saa liigutada iseenda alamväljaks",
            autoType:
              'Välja tüüp "auto". ' +
              "Välja tüüp määratakse automaatselt väärtuse põhjal " +
              "ja võib olla sõne, number, tõeväärtus või null.",
            objectType: 'Välja tüüp "objekt". ' + "Objekt sisaldab järjestamata võti/väärtus paaride kogumit.",
            arrayType: 'Välja tüüp "massiiv". ' + "Massiiv sisaldab järjestatud väärtuste kogumit.",
            stringType:
              'Välja tüüp "sõne". ' + "Välja tüüpi ei määrata väärtuse põhjal, " + "vaid tagastatakse alati sõnena.",
            modeEditorTitle: "Vaheta redaktori režiimi",
            modeCodeText: "Kood",
            modeCodeTitle: "Lülitu koodi esiletõstule",
            modeFormText: "Vorm",
            modeFormTitle: "Lülitu vormi redaktorile",
            modeTextText: "Tekst",
            modeTextTitle: "Lülitu lihtteksti redaktorile",
            modeTreeText: "Puu",
            modeTreeTitle: "Lülitu puu redaktorile",
            modeViewText: "Vaade",
            modeViewTitle: "Lülitu puu vaatele",
            modePreviewText: "Eelvaade",
            modePreviewTitle: "Lülitu eelvaate režiimile",
            examples: "Näited",
            default: "Vaikimisi",
            containsInvalidProperties: "Sisaldab vigaseid omadusi",
            containsInvalidItems: "Sisaldab vigaseid elemente",
          },
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
      // Find the closest JSON editor node - improved selectors for all data types
      const jsonNode = element.closest(
        ".jsoneditor-value, .jsoneditor-field, .jsoneditor-string, .jsoneditor-number, .jsoneditor-boolean, .jsoneditor-null, .jsoneditor-object, .jsoneditor-array"
      );

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
        const valueToReplace = dragData.value || dragData.data || dragData;

        // Get the element under the cursor
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (element) {
          // Find the closest JSON editor node
          const jsonNode = element.closest(
            ".jsoneditor-value, .jsoneditor-field, .jsoneditor-string, .jsoneditor-number, .jsoneditor-boolean, .jsoneditor-null, .jsoneditor-object, .jsoneditor-array"
          );

          if (jsonNode) {
            console.log("Found JSON node:", jsonNode.className, jsonNode.textContent);

            // Get the current JSON data
            const currentData = jsonEditorRef.current.get();

            // Try to find the path to the dropped node
            const path = findNodePath(jsonNode, currentData);
            console.log("Found path:", path, "Value to replace:", valueToReplace);

            if (path) {
              // Update the value at the specific path
              const newData = updateValueAtPath(currentData as Record<string, unknown>, path, valueToReplace);
              jsonEditorRef.current.set(newData);
              setData(newData as typeof data);
              console.log("Successfully updated data at path:", path);
            } else {
              console.log("Could not find path for node:", jsonNode);
            }
          } else {
            console.log("No JSON node found at drop position");
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
