import clsx from 'clsx';
import { useSelect } from 'downshift';
import { SelectHTMLAttributes, useEffect, useId, useState } from 'react';
import { MdArrowDropDown } from 'react-icons/md';

import { Icon } from '../../../components';

import './FormSelect.scss';

type SelectOption<T = string> = {
  label: string;
  value: T;
};

type FormSelectProps<T = string> = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'defaultValue'> & {
  label: string;
  name: string;
  hideLabel?: boolean;
  placeholder?: string;
  options: SelectOption<T>[];
  onSelectionChange?: (selection: SelectOption<T> | null) => void;
  defaultValue?: T;
  isOpen?: boolean;
  menuPosition?: 'absolute' | 'relative';
};

const itemToString = <T,>(item: SelectOption<T> | null) => {
  if (!item) return '';
  return typeof item.value === 'string' ? item.value : item.label;
};

const FormSelect = <T = string,>({
  label,
  hideLabel,
  options,
  disabled,
  placeholder,
  defaultValue,
  onSelectionChange,
  isOpen: isMenuOpen = false,
  menuPosition = 'absolute',
  ...rest
}: FormSelectProps<T>) => {
  const id = useId();
  const defaultSelected =
    options.find((o) =>
      typeof o.value === 'string' && typeof defaultValue === 'string'
        ? o.value === defaultValue
        : JSON.stringify(o.value) === JSON.stringify(defaultValue),
    ) ?? null;
  const [selectedItem, setSelectedItem] = useState<SelectOption<T> | null>(defaultSelected);
  const { isOpen, getToggleButtonProps, getLabelProps, getMenuProps, highlightedIndex, getItemProps } = useSelect({
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
    if (defaultValue != null) {
      setSelectedItem(
        options.find((o) =>
          typeof o.value === 'string' && typeof defaultValue === 'string'
            ? o.value === defaultValue
            : JSON.stringify(o.value) === JSON.stringify(defaultValue),
        ) ?? null,
      );
    }
  }, [defaultValue, options]);

  const selectClasses = clsx('select');

  return (
    <div className={selectClasses}>
      {label && !hideLabel && (
        <label htmlFor={id} className="select__label" {...getLabelProps()}>
          {label}
        </label>
      )}
      <div className="select__wrapper">
        <div
          className={`select__trigger ${disabled && 'select__trigger--disabled'}`}
          {...getToggleButtonProps()}
          style={{ color: selectedItem?.label ? '#1A1B1F' : '#5D6071' }}
          {...rest}
        >
          {selectedItem?.label ?? placeholder}
          <Icon label="Dropdown icon" size="medium" icon={<MdArrowDropDown color="#5D6071" size={16} />} />
        </div>
        <ul className={`select__menu select__menu--${menuPosition}`} {...getMenuProps()}>
          {isOpen &&
            options.map((item, index) => (
              <li
                className={clsx('select__option', { 'select__option--selected': highlightedIndex === index })}
                key={`${item.value}${index}`}
                {...getItemProps({ item, index })}
              >
                {item.label}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default FormSelect;
