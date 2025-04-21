import { useState } from "react";
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

// todo simple state
interface DragInputState {
  text: string;
}

const DragInput = ({ onChange, element, name, id }: DragInputProps) => {
  const [state, setState] = useState<DragInputState>({
    text: element?.key ?? "",
  });

  return element ? (
    // todo tooltip
    <OutputElementBox {...state} borderColor={getTypeColor(element?.data).color} />
  ) : (
    <FormInput
      // todo ???
      name={name}
      placeholder={t("serviceFlow.popup.dragElementHere")!}
      label=""
      className={styles.dragInput}
      onDrop={(e) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData("text/plain")) as Assign;
        if (data.id === id) return;
        onChange(data);
        setState({ text: data.key });
      }}
      // Disables focus, text cursor and everything related to keyboard input
      tabIndex={-1}
      onFocus={(e) => e.target.blur()}
      onDragOver={(e) => e.preventDefault()}
    />
  );
};

export default DragInput;
