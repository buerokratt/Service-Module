import React, { FC, SelectHTMLAttributes, useEffect, useId, useState } from 'react';
import { useSelect } from 'downshift';
import clsx from 'clsx';
import { MdArrowDropDown } from 'react-icons/md';

import { Icon } from '../../../components';
import './FormSelect.scss';

type FormSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  name: string;
  hideLabel?: boolean;
  placeholder?: string;
  options: {
    label: string;
    value: string;
  }[];
  onSelectionChange?: (selection: { label: string; value: string } | null) => void;
  isOpen?: boolean;
  isMenuAbsolute?: boolean;
  menuPosition?: "absolute" | "relative";
};

const itemToString = (item: { label: string; value: string } | null) => {
  return item ? item.value : "";
};

const FormSelect: FC<FormSelectProps> = ({
  label,
  hideLabel,
  options,
  disabled,
  placeholder,
  defaultValue,
  onSelectionChange,
  isOpen: isMenuOpen = false,
  isMenuAbsolute = true,
  menuPosition = 'absolute',
  ...rest
}) => {
  const id = useId();
  const defaultSelected = options.find((o) => o.value === defaultValue) ?? null;
  const [selectedItem, setSelectedItem] = useState<{ label: string, value: string } | null>(defaultSelected);
  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({
    id,
    items: options,
    itemToString,
    selectedItem,
    onSelectedItemChange: ({ selectedItem: newSelectedItem }) => {
      setSelectedItem(newSelectedItem ?? null);
      if (onSelectionChange) onSelectionChange(newSelectedItem ?? null);
    },
    defaultIsOpen: isMenuOpen,
  });

  useEffect(() => {
    if (defaultValue) {
      setSelectedItem(options.find((o) => o.value === defaultValue) ?? null);
    }
  }, [defaultValue, options]);

  const selectClasses = clsx(
    'select',
  );

  return (
    <div className={selectClasses}>
      {label && !hideLabel && <label htmlFor={id} className='select__label' {...getLabelProps()}>{label}</label>}
      <div className='select__wrapper'>
        <div className={`select__trigger ${disabled && 'select__trigger--disabled'}`} {...getToggleButtonProps()} style={{ color: selectedItem?.label ? '#1A1B1F' : '#5D6071' }} {...rest} >
          {selectedItem?.label ?? placeholder}
          <Icon label='Dropdown icon' size='medium' icon={<MdArrowDropDown color='#5D6071' size={16} />} />
        </div>
        <ul className={`select__menu select__menu--${menuPosition}`} {...getMenuProps()}>
          {isOpen && (
            options.map((item, index) => (
              <li className={clsx('select__option', { 'select__option--selected': highlightedIndex === index })}
                key={`${item.value}${index}`} {...getItemProps({ item, index })}>
                {item.label}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default FormSelect;
