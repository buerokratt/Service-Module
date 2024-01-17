import React, { useState } from 'react';
import { conditionOptions } from 'store/flow.store';
import { Rule } from './types';
import { FormInput, FormSelect, Icon, Track } from 'components';
import { MdDeleteOutline } from 'react-icons/md';

interface RuleElementProps {
  rule: Rule;
  onRemove: (id: string) => void;
  onChange: (rule: Rule) => void;
}

const RuleElement: React.FC<RuleElementProps> = ({ rule, onRemove, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({ ...rule, [e.target.name]: e.target.value });
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
          name='operator'
          onChange={handleChange}
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
