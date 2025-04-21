import { InputHTMLAttributes } from "react";
import { FormInput } from "components";
import styles from "./DragInput.module.scss";
import { DragData } from "types";

type DragInputProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
};

const DragInput = ({ ...rest }: DragInputProps) => {
  return (
    <FormInput
      label=""
      hideLabel
      className={styles.dragInput}
      onDrop={(e) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData("text/plain")) as DragData;
        console.log("drop", data);
        (e.target as HTMLInputElement).value = data.value;
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
