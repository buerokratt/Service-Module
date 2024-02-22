import React from 'react';
import { Rule } from './types';
import { FormInput, FormSelect, Icon, Track } from 'components';
import { MdDeleteOutline } from 'react-icons/md';

export const conditionOptions = [ 
  '==', '===', '!=', '!==', '>', '<', '>=', '<='
].map(x => ({ label: x, value: x }));

interface RuleElementProps {
  rule: Rule;
  onRemove: (id: string) => void;
  onChange: (rule: Rule) => void;
}

const RuleElement: React.FC<RuleElementProps> = ({ rule, onRemove, onChange }) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    change(e.target.name, e.target.value);
  }
  
  const handleSelectionChange = (e: { label: string; value: string; } | null) => {
    change('operator', e?.value);
  }

  const change = (name: string, value?: string) => {
    onChange({ ...rule, [name]: value })
  }

  return (
    <Track gap={16} isFlex>
      <Track gap={16} isFlex>
        <FormInput
          value={rule.field}
          name='field'
          onChange={handleChange}
          label=''
          hideLabel
        />
        <FormSelect
          value={rule.operator}
          defaultValue={rule.operator}
          name='operator'
          onSelectionChange={handleSelectionChange}
          options={conditionOptions}
          label=''
          hideLabel
        />
        <FormInput
          value={rule.value}
          name='value'
          onChange={handleChange}
          label=''
          hideLabel
        />
      </Track>
      <button onClick={() => onRemove(rule.id)} className='small-delete-rule-button rule-red'>
        <Icon icon={<MdDeleteOutline />} />
      </button>
    </Track>
  )
}

export default RuleElement;
