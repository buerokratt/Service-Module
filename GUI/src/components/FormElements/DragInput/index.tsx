import { InputHTMLAttributes, useState } from "react";
import { FormInput, OutputElementBox } from "components";
import styles from "./DragInput.module.scss";
import { DragData } from "types";

type DragInputProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  value: string;
};

type DragInputState = {
  text: string;
  borderColor: string | undefined;
};

const DragInput = ({ value, ...rest }: DragInputProps) => {
  // todo use DragData?
  const [state, setState] = useState<DragInputState>({
    text: value,
    borderColor: undefined,
  });

  return state.text ? (
    <OutputElementBox color="green" {...state} value={state.text} />
  ) : (
    <FormInput
      label=""
      hideLabel
      className={styles.dragInput}
      onDrop={(e) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData("text/plain")) as DragData;
        // e.target.value = data.text;
        setState({ ...data });
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
