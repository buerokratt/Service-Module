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
  console.log("Finding path for node:", node.className, node.textContent);

  // Try to find by text content (for values)
  const textContent = node.textContent?.trim();
  if (textContent) {
    console.log("Trying to find path by text content:", textContent);
    const path = findPathByValue(data, textContent);
    console.log("Found path by text content:", path);
    return path;
  }

  console.log("No path found for node");
  return null;
};

// Helper function to find path by field name
const findPathByFieldName = (obj: Record<string, unknown>, fieldName: string, currentPath = ""): string | null => {
  for (const key in obj) {
    const newPath = currentPath ? `${currentPath}.${key}` : key;

    if (key === fieldName) {
      return newPath;
    }

    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      const result = findPathByFieldName(obj[key] as Record<string, unknown>, fieldName, newPath);
      if (result) return result;
    }
  }
  return null;
};

// Helper function to find path by value
const findPathByValue = (obj: Record<string, unknown>, value: string, currentPath = ""): string | null => {
  for (const key in obj) {
    const newPath = currentPath ? `${currentPath}.${key}` : key;
    const objValue = obj[key];

    // Handle different value types
    if (objValue === value) {
      return newPath;
    }

    // Handle number comparison
    if (typeof objValue === "number" && !isNaN(Number(value)) && objValue === Number(value)) {
      return newPath;
    }

    // Handle boolean comparison
    if (typeof objValue === "boolean") {
      const boolValue = value.toLowerCase() === "true" ? true : value.toLowerCase() === "false" ? false : null;
      if (objValue === boolValue) {
        return newPath;
      }
    }

    // Handle null comparison
    if (objValue === null && value.toLowerCase() === "null") {
      return newPath;
    }

    // Recursively search in objects
    if (typeof objValue === "object" && objValue !== null && !Array.isArray(objValue)) {
      const result = findPathByValue(objValue as Record<string, unknown>, value, newPath);
      if (result) return result;
    }
  }
  return null;
};

// Helper function to update value at a specific path
const updateValueAtPath = (obj: Record<string, unknown>, path: string, newValue: unknown): Record<string, unknown> => {
  const pathParts = path.split(".");
  const newObj = { ...obj };
  let current: Record<string, unknown> = newObj;

  // Navigate to the parent of the target
  for (let i = 0; i < pathParts.length - 1; i++) {
    if (current[pathParts[i]] === undefined) {
      current[pathParts[i]] = {};
    }
    current = current[pathParts[i]] as Record<string, unknown>;
  }

  // Update the value at the target path
  const lastPart = pathParts[pathParts.length - 1];

  // Try to preserve the original type if possible
  const originalValue = current[lastPart];
  if (originalValue !== undefined) {
    // Convert newValue to match the original type
    if (typeof originalValue === "number" && typeof newValue === "string") {
      const numValue = Number(newValue);
      if (!isNaN(numValue)) {
        current[lastPart] = numValue;
      } else {
        current[lastPart] = newValue; // Keep as string if conversion fails
      }
    } else if (typeof originalValue === "boolean" && typeof newValue === "string") {
      if (newValue.toLowerCase() === "true") {
        current[lastPart] = true;
      } else if (newValue.toLowerCase() === "false") {
        current[lastPart] = false;
      } else {
        current[lastPart] = newValue; // Keep as string if conversion fails
      }
    } else {
      current[lastPart] = newValue;
    }
  } else {
    current[lastPart] = newValue;
  }

  return newObj;
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
  });

  useEffect(() => {
    if (editorRef.current && !jsonEditorRef.current) {
      const editor = new JSONEditor(editorRef.current, {
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
