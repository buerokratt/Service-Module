import { InputHTMLAttributes } from "react";
import { FormInput } from "components";

type DragInputProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
};

const DragInput = ({ ...rest }: DragInputProps) => {
  return (
    <FormInput
      label=""
      hideLabel
      // Disables focus, text cursor and everything related to keyboard input
      tabIndex={-1}
      onFocus={(e) => e.target.blur()}
      onDragOver={(e) => e.preventDefault()}
      {...rest}
    />
  );
};

export default DragInput;
