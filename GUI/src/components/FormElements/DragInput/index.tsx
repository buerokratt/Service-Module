import { ReactNode, useEffect, useRef, useState } from "react";
import { CheckBadge, FormCheckbox, FormInput, OutputElementBox, Tooltip } from "components";
import styles from "./DragInput.module.scss";
import { Assign } from "types";
import { t } from "i18next";
import { getTypeColor, isArray } from "utils/object-util";
import { stringToTemplate, templateToString } from "utils/string-util";

const getData = (e: React.DragEvent<HTMLInputElement>) => {
  e.preventDefault();
  return JSON.parse(e.dataTransfer.getData("text/plain")) as Assign;
};

const getArrayIndex = (value: string): number => {
  const base = templateToString(value);
  const index = base.match(/\[\d+\]$/);
  return index ? parseInt(index[0].slice(1, -1)) : 0;
};

const updateArrayIndex = (value: string, index: number): string => {
  let base = templateToString(value);
  base = base.replace(/\[\d+\]$/, "");
  return stringToTemplate(`${base}[${index}]`);
};

const updateArrayAll = (value: string): string => {
  let base = templateToString(value);
  base = base.replace(/\[\d+\]$/, "");
  return stringToTemplate(base);
};

interface DragInputProps {
  element: Assign | undefined;
  disallowedId: string;
  onChange: (data: Assign) => void;
}

const DragInput = ({ onChange, element, disallowedId }: DragInputProps): ReactNode => {
  const [all, setAll] = useState(false);
  const [arrayIndex, setArrayIndex] = useState(0);
  const [text, setText] = useState(element?.key ?? "");
  const [placeholder, setPlaceholder] = useState(t("serviceFlow.popup.dragElementHere"));
  const inputRef = useRef<HTMLInputElement>(null);

  const resetPlaceholder = () => {
    inputRef.current?.classList.remove(styles.dragHover, styles.dragHoverDisabled);
    setPlaceholder(t("serviceFlow.popup.dragElementHere"));
  };

  useEffect(() => {
    if (!element) return;

    if (isArray(element.data)) {
      const index = getArrayIndex(element.value);
      setArrayIndex(index);
    }
  }, [element]);

  if (element) {
    return (
      <Tooltip content={templateToString(element.value)}>
        <OutputElementBox borderColor={getTypeColor(element?.data).color} className={styles.element}>
          {isArray(element.data) ? (
            <div className={styles.array}>
              {text}
              {!all ? (
                <FormInput
                  name={element.value}
                  type="number"
                  min={0}
                  value={arrayIndex}
                  onChange={(e) => {
                    const index = Number(e.target.value);
                    setArrayIndex(index);
                    onChange({
                      ...element,
                      value: updateArrayIndex(element.value, index),
                    });
                  }}
                  className={styles.arrayIndex}
                />
              ) : (
                <></>
              )}
              <span className={styles.arrayAll}>
                <input
                  id="all"
                  type="checkbox"
                  checked={all}
                  onChange={(e) => {
                    setAll(e.target.checked);
                    onChange({ ...element, value: updateArrayAll(element.value) });
                  }}
                />
                <label htmlFor="all">{t("serviceFlow.popup.all")}</label>
              </span>
            </div>
          ) : (
            text
          )}
        </OutputElementBox>
      </Tooltip>
    );
  }

  return (
    <FormInput
      ref={inputRef}
      name=""
      placeholder={placeholder ?? ""}
      label=""
      className={styles.dragInput}
      onDrop={(e) => {
        const data = getData(e);

        if (disallowedId === data.id) {
          resetPlaceholder();
          return;
        }
        onChange({ ...data, value: updateArrayIndex(data.value, arrayIndex) });
        setText(data.key);
      }}
      // Disable focus, text cursor and everything related to keyboard input
      tabIndex={-1}
      onFocus={(e) => e.target.blur()}
      onDragOver={(e) => {
        const data = getData(e);

        inputRef.current?.classList.add(disallowedId === data.id ? styles.dragHoverDisabled : styles.dragHover);
        if (disallowedId === data.id) setPlaceholder(t("serviceFlow.popup.assignToSelfNotAllowed"));
      }}
      onDragLeave={resetPlaceholder}
    />
  );
};

export default DragInput;
