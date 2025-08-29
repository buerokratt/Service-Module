import React, { FC, useId } from 'react';

import './FormCheckbox.scss';

type FormCheckboxType = {
  label?: string;
  name?: string;
  hideLabel?: boolean;
  item: {
    label: string;
    value: string;
  };
  checked: boolean;
  onChange: () => void;
};

const FormCheckbox: FC<FormCheckboxType> = ({ label, name, hideLabel, item, checked, onChange }) => {
  const uid = useId();

  return (
    <div className="checkbox">
      {label && !hideLabel && <label className="checkbox__label">{label}</label>}
      <div className="checkbox__item">
        <input type="checkbox" name={name} id={uid} value={item.value} checked={checked} onChange={onChange} />
        <label htmlFor={uid}>{item.label}</label>
      </div>
    </div>
  );
};

export default FormCheckbox;
