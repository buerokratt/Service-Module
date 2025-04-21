import { useState } from "react";
import { FormInput, OutputElementBox } from "components";
import styles from "./DragInput.module.scss";
import { AssignSlot } from "types";

interface DragInputProps {
  // todo do i need this prop? move here from outer?
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

// todo simple state
interface DragInputState {
  text: string;
}

const DragInput = ({ value, onChange, ...rest }: DragInputProps) => {
  const [state, setState] = useState<DragInputState>({
    text: value,
  });

  return state.text ? (
    <OutputElementBox {...state} />
  ) : (
    <FormInput
      label=""
      hideLabel
      className={styles.dragInput}
      onDrop={(e) => {
        // todo prevent if same ID
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData("text/plain")) as AssignSlot;
        console.log("onDrop", data);
        onChange(data.value);
        setState({ text: data.key });
      }}
      // Disables focus, text cursor and everything related to keyboard input
      tabIndex={-1}
      onFocus={(e) => e.target.blur()}
      onDragOver={(e) => e.preventDefault()}
      {...rest}
    />
  );
};

export default DragInput;
