import { useEffect, useRef, useState } from "react";
import { FormInput, OutputElementBox, Tooltip } from "components";
import styles from "./DragInput.module.scss";
import { Assign } from "types";
import { t } from "i18next";
import { getTypeColor, isArray } from "utils/object-util";
import { stringToTemplate, templateToString } from "utils/string-util";

const getData = (e: React.DragEvent<HTMLInputElement>) => {
  e.preventDefault();
  return JSON.parse(e.dataTransfer.getData("text/plain")) as Assign;
};

interface DragInputProps {
  element: Assign | undefined;
  disallowedId: string;
  onChange: (data: Assign) => void;
}

const DragInput = ({ onChange, element, disallowedId }: DragInputProps) => {
  const [text, setText] = useState(element?.key ?? "");
  const [placeholder, setPlaceholder] = useState(t("serviceFlow.popup.dragElementHere"));
  const inputRef = useRef<HTMLInputElement>(null);

  const resetPlaceholder = () => {
    inputRef.current?.classList.remove(styles.dragHover, styles.dragHoverDisabled);
    setPlaceholder(t("serviceFlow.popup.dragElementHere"));
  };

  // todo use effect to set value if array on []
  useEffect(() => {
    console.log("use effect");
    if (isArray(element?.data)) {
      setText(element?.value);
    }
  }, []);
  // todo off by one AC
  // todo implement slicing for other arrays too MAYBE -- if not, check for input key here?
  // todo css

  if (element) {
    return (
      <Tooltip content={templateToString(element.value)}>
        <OutputElementBox borderColor={getTypeColor(element?.data).color}>
          {isArray(element.data) ? (
            <>
              {text}
              <FormInput
                name={element.value}
                type="number"
                min={1}
                // todo maybe remove? AND SET VALUE
                // defaultValue={1}
                onChange={(e) => {
                  let base = templateToString(element.value);
                  base = base.replace(/\[\d+\]$/, "");
                  const newValue = stringToTemplate(`${base}[${e.target.value}]`);
                  onChange({ ...element, value: newValue });
                }}
              />
            </>
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
        onChange(data);
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
