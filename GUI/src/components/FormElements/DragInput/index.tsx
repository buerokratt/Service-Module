import { InputHTMLAttributes, useState } from "react";
import { FormInput, OutputElementBox } from "components";
import styles from "./DragInput.module.scss";
import { DragData } from "types";

type DragInputProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type DragInputState = {
  text: string;
  borderColor: string | undefined;
};

const DragInput = ({ value, onChange, ...rest }: DragInputProps) => {
  // todo use DragData?
  const [state, setState] = useState<DragInputState>({
    text: value,
    borderColor: undefined,
  });

  return state.text ? (
    <OutputElementBox color="green" {...state} />
  ) : (
    <FormInput
      label=""
      hideLabel
      className={styles.dragInput}
      onDrop={(e) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData("text/plain")) as DragData;
        // e.target.value = data.text;
        onChange({
          target: {
            name: "value",
            value: data.value,
          },
        } as React.ChangeEvent<HTMLInputElement>);
        setState({ ...data });
      }}
      // Disables focus, text cursor and everything related to keyboard input
      tabIndex={-1}
      onFocus={(e) => e.target.blur()}
      onDragOver={(e) => e.preventDefault()}
      // onChange={(e) => {
      //   console.log("onChange", e.target.value);
      //   return onChange!(e.target.value);
      // }}
      {...rest}
    />
  );
};

export default DragInput;
