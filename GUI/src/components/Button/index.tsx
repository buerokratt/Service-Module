import React, { ButtonHTMLAttributes, FC, PropsWithChildren, useRef } from "react";
import clsx from "clsx";

import "./Button.scss";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  appearance?: "primary" | "secondary" | "text" | "icon" | "error" | "success" | "loading";
  size?: "m" | "s";
  className?: string;
};

const Button: FC<PropsWithChildren<ButtonProps>> = ({
  appearance = "primary",
  size = "m",
  disabled,
  children,
  className,
  ...rest
}) => {
  const ref = useRef<HTMLButtonElement>(null);

  const buttonClasses = clsx("btn", `btn--${appearance}`, `btn--${size}`, disabled && "btn--disabled", className);

  return (
    <button className={buttonClasses} ref={ref} disabled={disabled || appearance === "loading"} {...rest}>
      {children}
    </button>
  );
};

export default Button;
