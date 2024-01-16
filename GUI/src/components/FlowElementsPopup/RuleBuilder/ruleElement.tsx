import React, { useState } from 'react';
import { conditionOptions } from 'store/flow.store';
import { Rule, getInitialRule } from './types';
import { FormInput, FormSelect, Icon, Track } from 'components';
import { MdDeleteOutline } from 'react-icons/md';

interface RuleElementProps {
  rule: Rule;
  onRemove: (id: string) => void;
}

const RuleElement: React.FC<RuleElementProps> = ({ rule, onRemove }) => {
  const [currentRule, setCurrentRule] = useState(getInitialRule());

  return (
    <Track gap={16} isFlex>
      <Track gap={16} isFlex>
        <FormInput
          value={currentRule.field}
          name='field'
          onChange={(e) => setCurrentRule({ ...currentRule, field: e.target.value })}
          label=''
          hideLabel
        />
        <FormSelect
          value={currentRule.operator}
          name='operator'
          onChange={(e) => setCurrentRule({ ...currentRule, operator: e.target.value })}
          options={conditionOptions}
          label=''
          hideLabel
        />
        <FormInput
          value={currentRule.value}
          name='value'
          onChange={(e) => setCurrentRule({ ...currentRule, value: e.target.value })}
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
