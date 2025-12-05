import { DragInput, FormInput, Icon, Tooltip, Track } from 'components';
import { t } from 'i18next';
import React, { useState } from 'react';
import { MdDataObject, MdDeleteOutline, MdEdit, MdMoveDown } from 'react-icons/md';
import useToastStore from 'store/toasts.store';
import { getDragData } from 'utils/component-util';
import { isArray, isObject } from 'utils/object-util';
import { isTemplate, stringToTemplate, templateToString } from 'utils/string-util';

import styles from './AssignElement.module.scss';
import ObjectEditor from './ObjectEditor';
import { Assign } from '../../../types/assign';

import '../styles.scss';

const showInvalidObjectError = () => {
  useToastStore.getState().error({
    title: t('serviceFlow.apiElements.cannotOpenEditor'),
    message: t('serviceFlow.apiElements.invalidObjectError'),
  });
};

interface AssignElementProps {
  element: Assign;
  onRemove?: (id: string) => void;
  onChange: (element: Assign) => void;
  manualEdit?: boolean;
  isKeyEditable?: boolean;
  keyStyle?: React.CSSProperties;
  valueStyle?: React.CSSProperties;
}

const AssignElement: React.FC<AssignElementProps> = ({
  element,
  onRemove,
  onChange,
  manualEdit = false,
  isKeyEditable,
  keyStyle,
  valueStyle,
}) => {
  const slots = element.slots ?? [];
  const [isSecondSlotOpen, setIsSecondSlotOpen] = useState(!!slots[1]);
  const [isEditingManually, setIsEditingManually] = useState(manualEdit === true || element.isValueManual === true);
  const [isObjectEditorOpen, setIsObjectEditorOpen] = useState(element.isObject ?? false);

  const changeKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trimStart().replaceAll(/_+/g, '_');
    const hasSpecialCharacters = /[^\p{L}\p{N}_ ]/u;
    if (!hasSpecialCharacters.test(value) && !value.startsWith(' ')) {
      onChange({ ...element, key: value.replaceAll(' ', '_') });
    }
  };

  const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...element, value: e.target.value });
  };

  const changeManualInputValue = (e: React.DragEvent<HTMLInputElement>) => {
    const data = getDragData(e);
    onChange({ ...element, value: data.value });
  };

  const changeFirstSlot = (data: Assign) => {
    onChange({ ...element, value: data.value, slots: [data] });
  };

  const resetSecondSlot = () => {
    if (!slots[0]) return;

    onChange({ ...element, value: slots[0].value, slots: [slots[0]] });
  };

  const changeSecondSlot = (data: Assign) => {
    if (!slots[0]) return;

    const elementValueContent = templateToString(element.value);
    const dataValueContent = templateToString(data.value);
    const value = stringToTemplate(`${elementValueContent}[${dataValueContent}]`);

    onChange({ ...element, value, slots: [slots[0], data] });
  };

  const toggleManualEdit = () => {
    const newMode = !element.isValueManual;
    setIsEditingManually(newMode);
    onChange({ ...element, slots: undefined, isValueManual: newMode });
  };

  const canOpenObjectEditor = () => {
    if (element.value === '') return true;

    if (!isTemplate(element.value)) {
      showInvalidObjectError();
      return false;
    }

    try {
      JSON.parse(templateToString(element.value));
      return true;
    } catch (error) {
      console.log('Error parsing input', error);
      showInvalidObjectError();
      return false;
    }
  };

  const toggleObjectEditor = () => {
    if (isObjectEditorOpen) {
      setIsObjectEditorOpen(false);
      return;
    }

    if (canOpenObjectEditor()) {
      setIsObjectEditorOpen(true);
    }
  };

  const canShowSecondSlotToggle = Boolean(slots[0] && isObject(slots[0].data) && !isArray(slots[0].data));

  const renderManualValueInput = () => (
    <FormInput
      value={element.value}
      name="value"
      onChange={changeValue}
      label=""
      style={valueStyle}
      hideLabel
      onDrop={changeManualInputValue}
    />
  );

  const renderSecondSlotToggle = () =>
    canShowSecondSlotToggle ? (
      <Tooltip
        content={t(isSecondSlotOpen ? 'serviceFlow.popup.removeValueAssignment' : 'serviceFlow.popup.assignAsValue')}
        onButtonClick={() => {
          setIsSecondSlotOpen(!isSecondSlotOpen);
          if (!isSecondSlotOpen) resetSecondSlot();
        }}
      >
        <div className={`small-assign-button ${isSecondSlotOpen ? 'assign-red' : 'assign-blue'}`}>
          <Icon icon={<MdMoveDown />} />
        </div>
      </Tooltip>
    ) : null;

  const renderDragInputs = () => (
    <Track gap={3} isFlex>
      <DragInput id={element.id} element={slots[0]} onChange={changeFirstSlot} />
      {renderSecondSlotToggle()}
      {isSecondSlotOpen ? <DragInput id={element.id} element={slots[1]} onChange={changeSecondSlot} /> : null}
    </Track>
  );

  const renderManualToggle = () =>
    manualEdit ? null : (
      <Tooltip content={t('serviceFlow.popup.assignManualEdit')} onButtonClick={toggleManualEdit}>
        <div className={`small-assign-button assign-${isEditingManually ? 'red' : 'blue'}`}>
          <Icon icon={<MdEdit />} />
        </div>
      </Tooltip>
    );

  return (
    <>
      <Track gap={16} isFlex className={styles.assignElement}>
        <FormInput
          value={element.key}
          name="key"
          disabled={isKeyEditable === false}
          onChange={changeKey}
          onDrop={(e) => e.preventDefault()}
          style={keyStyle}
          label=""
          hideLabel
        />
        :
        <Track style={{ flex: '1 0 75%', justifyContent: 'flex-end' }} gap={5}>
          {!isObjectEditorOpen && (
            <>
              {isEditingManually ? renderManualValueInput() : renderDragInputs()}
              {renderManualToggle()}
            </>
          )}

          {!isEditingManually && (
            <Tooltip content={t('serviceFlow.popup.openObjectEditor')} onButtonClick={toggleObjectEditor}>
              <div className="small-assign-button assign-blue">
                <Icon icon={<MdDataObject />} />
              </div>
            </Tooltip>
          )}

          {onRemove && (
            <button onClick={() => onRemove(element.id)} className="small-assign-button assign-red">
              <Icon icon={<MdDeleteOutline />} />
            </button>
          )}
        </Track>
      </Track>

      {isObjectEditorOpen && (
        <ObjectEditor
          data={element.value ? JSON.parse(templateToString(element.value)) : {}}
          onChange={(value) => onChange({ ...element, value, isObject: true })}
        />
      )}
    </>
  );
};

export default AssignElement;
