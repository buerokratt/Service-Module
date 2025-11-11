import { FormInput, OutputElementBox, Tooltip } from 'components';
import { t } from 'i18next';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Assign } from 'types';
import { getDragData } from 'utils/component-util';
import { getTypeColor, isArray } from 'utils/object-util';
import { isTemplate, stringToTemplate, templateToString } from 'utils/string-util';

import styles from './DragInput.module.scss';

const ARRAY_INDEX_PATTERN = /\[\d+\]$/;

const getArrayIndex = (value: string): number => {
  const base = templateToString(value);
  const index = ARRAY_INDEX_PATTERN.exec(base);
  return index ? parseInt(index[0].slice(1, -1)) : 0;
};

const updateArrayIndex = (value: string, index?: number): string => {
  let base = templateToString(value);
  base = base.replace(ARRAY_INDEX_PATTERN, '');
  return stringToTemplate(index !== undefined ? `${base}[${index}]` : base);
};

interface DragInputProps {
  element: Assign | undefined;
  id: string;
  onChange: (data: Assign) => void;
}

const DragInput = ({ onChange, element, id }: DragInputProps): ReactNode => {
  const [all, setAll] = useState(false);
  const [arrayIndex, setArrayIndex] = useState(0);
  const [text, setText] = useState(element?.key ?? '');
  const [placeholder, setPlaceholder] = useState(t('serviceFlow.popup.dragElementHere'));
  const inputRef = useRef<HTMLInputElement>(null);

  const resetPlaceholder = () => {
    inputRef.current?.classList.remove(styles.dragHover, styles.dragHoverDisabled);
    setPlaceholder(t('serviceFlow.popup.dragElementHere'));
  };

  useEffect(() => {
    if (!element) return;

    if (isArray(element.data)) {
      const index = getArrayIndex(element.value);
      setArrayIndex(index);
    }
  }, [element]);

  if (element) {
    return (
      <Tooltip content={isTemplate(element.value) ? templateToString(element.value) : element.value}>
        <OutputElementBox borderColor={getTypeColor(element?.data).color} className={styles.element}>
          {isArray(element.data) ? (
            <div className={styles.array}>
              {t(text)}
              {!all ? (
                <FormInput
                  name={element.value}
                  type="number"
                  min={0}
                  value={arrayIndex}
                  onChange={(e) => {
                    const index = Number(e.target.value);
                    setArrayIndex(index);
                    onChange({
                      ...element,
                      value: updateArrayIndex(element.value, index),
                    });
                  }}
                  className={styles.arrayIndex}
                />
              ) : (
                <></>
              )}
              <div className={styles.arrayAll}>
                <input
                  id={`${id}-all`}
                  type="checkbox"
                  checked={all}
                  onChange={(e) => {
                    setAll(e.target.checked);
                    onChange({ ...element, value: updateArrayIndex(element.value) });
                  }}
                />
                <label htmlFor={`${id}-all`}>{t('serviceFlow.popup.all')}</label>
              </div>
            </div>
          ) : (
            t(text)
          )}
        </OutputElementBox>
      </Tooltip>
    );
  }

  return (
    <FormInput
      ref={inputRef}
      name=""
      placeholder={placeholder ?? ''}
      label=""
      className={styles.dragInput}
      onDrop={(e) => {
        const data = getDragData(e);

        if (id === data.id) {
          inputRef.current?.classList.add(styles.dragHoverDisabled);
          setPlaceholder(t('serviceFlow.popup.assignToSelfNotAllowed'));
          setTimeout(() => {
            resetPlaceholder();
          }, 800);
          return;
        }
        onChange({ ...data, value: isArray(data.data) ? updateArrayIndex(data.value, 0) : data.value });

        setText(data.key);
      }}
      // Disable focus, text cursor and everything related to keyboard input
      tabIndex={-1}
      onFocus={(e) => e.target.blur()}
      // Have to use onDragOver since onDragEnter is broken in Firefox
      onDragOver={(e) => {
        // Prevents text cursor from appearing inside input
        e.preventDefault();
        inputRef.current?.classList.add(styles.dragHover);
      }}
      onDragLeave={resetPlaceholder}
    />
  );
};

export default DragInput;
