import { useRef, useState } from "react";
import { FormInput, OutputElementBox, Tooltip } from "components";
import styles from "./DragInput.module.scss";
import { Assign } from "types";
import { t } from "i18next";
import { getTypeColor } from "utils/object-util";
import { templateToString } from "utils/string-util";

interface DragInputProps {
  element: Assign | undefined;
  disallowedId: string;
  onChange: (data: Assign) => void;
}

const DragInput = ({ onChange, element, disallowedId }: DragInputProps) => {
  const [text, setText] = useState(element?.key ?? "");
  const [placeholder, setPlaceholder] = useState(t("serviceFlow.popup.dragElementHere"));
  const inputRef = useRef<HTMLInputElement>(null);

  const getData = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    return JSON.parse(e.dataTransfer.getData("text/plain")) as Assign;
  };

  const resetPlaceholder = () => {
    inputRef.current?.classList.remove(styles.dragHover, styles.dragHoverDisabled);
    setPlaceholder(t("serviceFlow.popup.dragElementHere"));
  };

  return element ? (
    <Tooltip content={templateToString(element.value)}>
      <OutputElementBox text={text} borderColor={getTypeColor(element?.data).color} />
    </Tooltip>
  ) : (
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
