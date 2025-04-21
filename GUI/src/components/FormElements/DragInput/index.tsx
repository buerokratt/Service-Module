import { InputHTMLAttributes, useState } from "react";
import { FormInput, OutputElementBox } from "components";
import styles from "./DragInput.module.scss";
import { DragData } from "types";

type DragInputProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  value: string;
};

const DragInput = ({ value, ...rest }: DragInputProps) => {
  const [text, setText] = useState(value);
  const [borderColor, setBorderColor] = useState<string | undefined>(undefined);

  return text ? (
    <OutputElementBox text={text} color="green" borderColor={borderColor} />
  ) : (
    <FormInput
      label=""
      hideLabel
      className={styles.dragInput}
      onDrop={(e) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData("text/plain")) as DragData;
        setText(data.text);
        setBorderColor(data.borderColor);
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
