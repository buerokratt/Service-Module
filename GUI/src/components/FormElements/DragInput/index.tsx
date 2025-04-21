import { useRef, useState } from "react";
import { FormInput, OutputElementBox } from "components";
import styles from "./DragInput.module.scss";
import { Assign } from "types";
import { t } from "i18next";
import { getTypeColor } from "utils/object-util";

interface DragInputProps {
  // todo do i need this prop? move here from outer?
  name: string;
  id?: string;
  element?: Assign;
  onChange: (data: Assign) => void;
}

const DragInput = ({ onChange, element, name, id }: DragInputProps) => {
  const [text, setText] = useState(element?.key ?? "");
  const [placeholder, setPlaceholder] = useState(t("serviceFlow.popup.dragElementHere")!);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetPlaceholder = () => {
    inputRef.current?.classList.remove(styles.dragHover, styles.dragHoverDisabled);
    setPlaceholder(t("serviceFlow.popup.dragElementHere")!);
  };

  const getData = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    return JSON.parse(e.dataTransfer.getData("text/plain")) as Assign;
  };

  return element ? (
    // todo tooltip
    <OutputElementBox text={text} borderColor={getTypeColor(element?.data).color} />
  ) : (
    <FormInput
      ref={inputRef}
      // todo ???
      name={name}
      placeholder={placeholder}
      label=""
      className={styles.dragInput}
      onDrop={(e) => {
        const data = getData(e);

        if (data.id === id) {
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

        inputRef.current?.classList.add(data.id === id ? styles.dragHoverDisabled : styles.dragHover);
        if (data.id === id) setPlaceholder(t("serviceFlow.popup.assignToSelfNotAllowed")!);
      }}
      onDragLeave={resetPlaceholder}
    />
  );
};

export default DragInput;
