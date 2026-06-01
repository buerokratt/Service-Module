import { DragInput, FormInput, Icon, Tooltip, Track } from 'components';
import { t } from 'i18next';
import React, { useState } from 'react';
import { MdDeleteOutline, MdEdit } from 'react-icons/md';
import { Assign } from 'types/assign';
import { getDragData } from 'utils/component-util';

import '../styles.scss';

interface JumpToServiceInputElementProps {
  element: Assign;
  onRemove?: (id: string) => void;
  onChange: (element: Assign) => void;
}

const JumpToServiceInputElement: React.FC<JumpToServiceInputElementProps> = ({ element, onRemove, onChange }) => {
  const [isEditingManually, setIsEditingManually] = useState(element.isValueManual ?? false);

  const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...element, value: e.target.value });
  };

  const changeManualInputValue = (e: React.DragEvent<HTMLInputElement>) => {
    const data = getDragData(e);
    onChange({ ...element, value: data.value });
  };

  const changeDragSlot = (data: Assign) => {
    onChange({ ...element, value: data.value, slots: [data] });
  };

  const toggleManualEdit = () => {
    const newMode = !isEditingManually;
    setIsEditingManually(newMode);
    onChange({ ...element, slots: undefined, isValueManual: newMode });
  };

  return (
    <Track gap={5} isFlex style={{ padding: '8px 16px' }}>
      {isEditingManually ? (
        <FormInput
          value={element.value}
          name="value"
          onChange={changeValue}
          label=""
          hideLabel
          onDrop={changeManualInputValue}
          style={{ flex: 1 }}
        />
      ) : (
        <Track style={{ flex: 1 }}>
          <DragInput id={element.id} element={element.slots?.[0]} onChange={changeDragSlot} />
        </Track>
      )}
      <Tooltip content={t('serviceFlow.popup.assignManualEdit')} onButtonClick={toggleManualEdit}>
        <div className={`small-assign-button assign-${isEditingManually ? 'red' : 'blue'}`}>
          <Icon icon={<MdEdit />} />
        </div>
      </Tooltip>
      {onRemove && (
        <button onClick={() => onRemove(element.id)} className="small-assign-button assign-red">
          <Icon icon={<MdDeleteOutline />} />
        </button>
      )}
    </Track>
  );
};

export default JumpToServiceInputElement;
