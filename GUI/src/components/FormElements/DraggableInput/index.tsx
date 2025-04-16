import React, { forwardRef, InputHTMLAttributes } from "react";
import clsx from "clsx";
import "./FormInput.scss";

type DraggableInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  hideLabel?: boolean;
};

const DraggableInput = forwardRef<HTMLInputElement, DraggableInputProps>(({ label, name, hideLabel, ...rest }, ref) => {
  const inputClasses = clsx("input");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent any keyboard input
    e.preventDefault();
  };

  // const handleDrop = (e: React.DragEvent<HTMLInputElement>) => {
  //   e.preventDefault();
  //   const value = e.dataTransfer.getData("text/plain");
  //   if (value) {
  //     // Trigger onChange with the dropped value
  //     const event = {
  //       target: {
  //         name,
  //         value,
  //       },
  //     } as React.ChangeEvent<HTMLInputElement>;
  //     rest.onChange?.(event);
  //   }
  // };

  return (
    <div className={inputClasses}>
      {label && !hideLabel && <label className="input__label">{label}</label>}
      <div className="input__wrapper">
        <input
          className={inputClasses}
          name={name}
          ref={ref}
          aria-label={hideLabel ? label : undefined}
          onKeyDown={handleKeyDown}
          // onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          {...rest}
        />
      </div>
    </div>
  );
});

DraggableInput.displayName = "DraggableInput";

export default DraggableInput;
