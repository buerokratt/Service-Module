import React, { forwardRef, InputHTMLAttributes } from "react";
import clsx from "clsx";
import { FormInput } from "components";

type DraggableInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  hideLabel?: boolean;
};

// todo props type
const DragInput = forwardRef<HTMLInputElement, DraggableInputProps>(({ ...rest }, ref) => {
  return (
    <FormInput
      // Disables focus, text cursor and everything related to keyboard input
      tabIndex={-1}
      onFocus={(e) => e.target.blur()}
      onDragOver={(e) => e.preventDefault()}
      {...rest}
      ref={ref}
    />
  );
});

DragInput.displayName = "DraggableInput";

export default DragInput;
