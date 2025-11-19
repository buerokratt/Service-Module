import { DragInput, FormInput, FormSelect, Icon, Tooltip, Track } from 'components';
import { t } from 'i18next';
import React from 'react';
import { MdDeleteOutline, MdEdit } from 'react-icons/md';
import { Assign } from 'types';
import { getDragData } from 'utils/component-util';

import { Rule } from './types';

const conditionOptions = ['==', '===', '!=', '!==', '>', '<', '>=', '<='].map((x) => ({ label: x, value: x }));

interface RuleElementProps {
  rule: Rule;
  onRemove: (id: string) => void;
  onChange: (rule: Rule) => void;
}

const RuleElement: React.FC<RuleElementProps> = ({ rule, onRemove, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    change(e.target.name, e.target.value);
  };

  const handleFieldDrop = (e: React.DragEvent<HTMLInputElement>) => {
    const data = getDragData(e);
    onChange({ ...rule, field: data.value });
  };

  const handleValueDrop = (e: React.DragEvent<HTMLInputElement>) => {
    const data = getDragData(e);
    onChange({ ...rule, value: data.value });
  };

  const handleSelectionChange = (e: { label: string; value: string } | null) => {
    change('operator', e?.value);
  };

  const change = (name: string, value?: string | boolean | Assign) => {
    onChange({ ...rule, [name]: value });
  };

  const handleFieldDragChange = (dragElement: Assign) => {
    onChange({
      ...rule,
      fieldDragElement: dragElement,
      field: dragElement.value,
      isFieldManual: false,
    });
  };

  const handleValueDragChange = (dragElement: Assign) => {
    onChange({
      ...rule,
      valueDragElement: dragElement,
      value: dragElement.value,
      isValueManual: false,
    });
  };

  const toggleFieldMode = () => {
    const newMode = !rule.isFieldManual;
    onChange({
      ...rule,
      isFieldManual: newMode,
    });
  };

  const toggleValueMode = () => {
    const newMode = !rule.isValueManual;
    onChange({
      ...rule,
      isValueManual: newMode,
    });
  };

  return (
    <Track gap={16} isFlex>
      <Track gap={16} isFlex>
        {!rule.isFieldManual && (
          <DragInput id={`field-${rule.id}`} element={rule.fieldDragElement} onChange={handleFieldDragChange} />
        )}
        {rule.isFieldManual && (
          <FormInput
            value={rule.field}
            name="field"
            onChange={handleChange}
            onDrop={handleFieldDrop}
            label=""
            hideLabel
          />
        )}
        <Tooltip content={t('serviceFlow.popup.assignManualEdit')} onButtonClick={toggleFieldMode}>
          <div className="small-assign-button assign-blue">
            <Icon icon={<MdEdit />} />
          </div>
        </Tooltip>
        <FormSelect
          value={rule.operator}
          defaultValue={rule.operator}
          name="operator"
          onSelectionChange={handleSelectionChange}
          options={conditionOptions}
          label=""
          hideLabel
        />
        {!rule.isValueManual && (
          <DragInput id={`value-${rule.id}`} element={rule.valueDragElement} onChange={handleValueDragChange} />
        )}
        {rule.isValueManual && (
          <FormInput
            value={rule.value}
            name="value"
            onChange={handleChange}
            onDrop={handleValueDrop}
            label=""
            hideLabel
          />
        )}
        <Tooltip content={t('serviceFlow.popup.assignManualEdit')} onButtonClick={toggleValueMode}>
          <div className="small-assign-button assign-blue">
            <Icon icon={<MdEdit />} />
          </div>
        </Tooltip>
      </Track>
      <button onClick={() => onRemove(rule.id)} className="small-delete-rule-button rule-red">
        <Icon icon={<MdDeleteOutline />} />
      </button>
    </Track>
  );
};

export default RuleElement;
