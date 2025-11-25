import clsx from 'clsx';
import React, { forwardRef, InputHTMLAttributes, useId } from 'react';
import { MdOutlinePalette } from 'react-icons/md';

import { Icon } from '../../../components';
import './FormInput.scss';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  name: string;
  hideLabel?: boolean;
  colorInput?: boolean;
  showExclamation?: boolean;
  highlightPlaceholder?: boolean;
};

const FieldInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, name, disabled, hideLabel, colorInput, showExclamation, highlightPlaceholder, ...rest }, ref) => {
    const id = useId();

    const inputClasses = clsx('input', disabled && 'input--disabled');

    return (
      <div className={inputClasses}>
        {label && !hideLabel && (
          <label htmlFor={id} className="input__label">
            {label}
          </label>
        )}
        <div className="input__wrapper">
          <input
            className={`${inputClasses} ${highlightPlaceholder ? 'input-error' : ''}`}
            name={name}
            id={id}
            ref={ref}
            aria-label={hideLabel ? label : undefined}
            pattern={colorInput ? '^#([a-fA-F0-9]{3}){1,2}$' : undefined}
            {...rest}
          />
          {showExclamation && <span className="input-icon">!</span>}
          {colorInput && <Icon icon={<MdOutlinePalette fontSize={20} color="rgba(0,0,0,0.54)" />} />}
        </div>
      </div>
    );
  },
);

FieldInput.displayName = 'fieldInput';

export default FieldInput;
