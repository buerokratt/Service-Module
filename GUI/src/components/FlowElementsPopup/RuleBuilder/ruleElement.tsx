import { DragInput, FormInput, FormSelect, Icon, Tooltip, Track } from 'components';
import React, { useState } from 'react';
import { MdDeleteOutline, MdEdit } from 'react-icons/md';

import { Rule } from './types';
import { t } from 'i18next';

export const conditionOptions = ['==', '===', '!=', '!==', '>', '<', '>=', '<='].map((x) => ({ label: x, value: x }));

interface RuleElementProps {
  rule: Rule;
  onRemove: (id: string) => void;
  onChange: (rule: Rule) => void;
}

const RuleElement: React.FC<RuleElementProps> = ({ rule, onRemove, onChange }) => {
  const [isEditingFieldManually, setIsEditingFieldManually] = useState(false);
  const [isEditingValueManually, setIsEditingValueManually] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    change(e.target.name, e.target.value);
  };

  const handleSelectionChange = (e: { label: string; value: string } | null) => {
    change('operator', e?.value);
  };

  const change = (name: string, value?: string) => {
    onChange({ ...rule, [name]: value });
  };

  return (
    <Track gap={16} isFlex>
      <Track gap={16} isFlex>
        {!isEditingFieldManually && <DragInput id={''} element={undefined} onChange={() => {}} />}
        {isEditingFieldManually && (
          <FormInput value={rule.field} name="field" onChange={handleChange} label="" hideLabel />
        )}
        <Tooltip content={t('serviceFlow.popup.assignManualEdit')} onButtonClick={() => {
          setIsEditingFieldManually(!isEditingFieldManually);
        }}>
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
        {!isEditingValueManually && <DragInput id={''} element={undefined} onChange={() => {}} />}
        {isEditingValueManually && (
          <FormInput value={rule.value} name="value" onChange={handleChange} label="" hideLabel />
        )}
        <Tooltip
          content={t('serviceFlow.popup.assignManualEdit')}
          onButtonClick={() => {
            setIsEditingValueManually(!isEditingValueManually);
          }}
        >
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
